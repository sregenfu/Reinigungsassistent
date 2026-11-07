import Foundation
import RoomPlan
import Capacitor

/**
 * CleanHome RoomPlan iOS Plugin
 * Erlaubt es iPhones/iPads mit LiDAR-Sensor, Wände, Fenster, Türen
 * und Möbel (Tisch, Sofa, Spüle) automatisch beim Begehen des Zimmers zu vermessen
 * und als JSON-Struktur direkt in den 2D/3D Planer der App einzuspeisen.
 */
@objc(CleanHomeRoomPlanPlugin)
public class CleanHomeRoomPlanPlugin: CAPPlugin, RoomCaptureViewDelegate {
    
    private var roomCaptureView: RoomCaptureView?
    private var captureSessionConfig: RoomCaptureSession.Configuration = RoomCaptureSession.Configuration()
    private var savedCall: CAPPluginCall?
    
    @objc func isLiDARAvailable(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            let available = RoomCaptureSession.isSupported
            call.resolve([
                "available": available,
                "message": available ? "LiDAR & RoomPlan unterstützt" : "Gerät besitzt keinen LiDAR-Sensor"
            ])
        } else {
            call.resolve([
                "available": false,
                "message": "iOS 16 oder neuer erforderlich"
            ])
        }
    }
    
    @objc func startRoomScan(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else {
            call.reject("RoomPlan erfordert iOS 16 oder neuer")
            return
        }
        
        guard RoomCaptureSession.isSupported else {
            call.reject("Dieses iOS-Gerät unterstützt kein RoomPlan (LiDAR erforderlich)")
            return
        }
        
        self.savedCall = call
        
        DispatchQueue.main.async {
            guard let viewController = self.bridge?.viewController else {
                call.reject("Kein ViewController verfügbar")
                return
            }
            
            let captureView = RoomCaptureView(frame: viewController.view.bounds)
            captureView.delegate = self
            captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            self.roomCaptureView = captureView
            
            viewController.view.addSubview(captureView)
            captureView.captureSession.run(configuration: self.captureSessionConfig)
        }
    }
    
    // MARK: - RoomCaptureViewDelegate
    @available(iOS 16.0, *)
    public func captureView(shouldPresent roomDataForProcessing: CapturedRoomData, error: Error?) -> Bool {
        return true
    }
    
    @available(iOS 16.0, *)
    public func captureView(didPresent processedResult: CapturedRoom, error: Error?) {
        DispatchQueue.main.async {
            self.roomCaptureView?.removeFromSuperview()
            self.roomCaptureView = nil
        }
        
        if let error = error {
            self.savedCall?.reject("Fehler beim Scannen: \(error.localizedDescription)")
            return
        }
        
        // Konvertiere erfasste Wände, Fenster, Türen und Objekte in unser App-Format
        var wallsData: [[String: Any]] = []
        var objectsData: [[String: Any]] = []
        
        for wall in processedResult.walls {
            wallsData.append([
                "dimensions": [
                    "x": wall.dimensions.x,
                    "y": wall.dimensions.y,
                    "z": wall.dimensions.z
                ],
                "transform": [
                    wall.transform.columns.0.x, wall.transform.columns.0.y, wall.transform.columns.0.z,
                    wall.transform.columns.1.x, wall.transform.columns.1.y, wall.transform.columns.1.z,
                    wall.transform.columns.2.x, wall.transform.columns.2.y, wall.transform.columns.2.z,
                    wall.transform.columns.3.x, wall.transform.columns.3.y, wall.transform.columns.3.z
                ]
            ])
        }
        
        for object in processedResult.objects {
            var category = "moebel"
            switch object.category {
            case .sofa: category = "couch_eck"
            case .table: category = "tisch_gross"
            case .sink: category = "waschtisch"
            case .refrigerator, .oven, .stove: category = "kuecheninsel"
            default: category = "moebel"
            }
            
            objectsData.append([
                "category": category,
                "width": object.dimensions.x,
                "height": object.dimensions.z,
                "depth": object.dimensions.y
            ])
        }
        
        self.savedCall?.resolve([
            "success": true,
            "wallsCount": processedResult.walls.count,
            "doorsCount": processedResult.doors.count,
            "windowsCount": processedResult.windows.count,
            "walls": wallsData,
            "objects": objectsData
        ])
    }
}

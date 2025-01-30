import "./styles.css";
let deferredPrompt;
let barcodeDetector;
let detected = false;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;

  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome === 'accepted' ? 'User installed the app' : 'User dismissed the installation');
      deferredPrompt = null;
    });
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
        registration.update();
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              window.location.reload();
            }
          });
        });
      })
      .catch((error) => console.log('Service Worker registration failed:', error));
  });
}

if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.sync.register('send-push-notification')
      .then(() => console.log('Background Sync Registered'))
      .catch((error) => console.error('Error registering background sync:', error));
  });
}

if (!("BarcodeDetector" in globalThis)) {
  console.log("Barcode Detector is not supported by this browser.");
} else {
  console.log("Barcode Detector supported!");
  barcodeDetector = new BarcodeDetector({ formats: ["code_39", "codabar", "ean_13"] });
}

function showPopup(barcode) {
  console.log("Barcode detected:", barcode);
  document.getElementById("popup-message").textContent = `Barcode detected ${barcode}`;
  document.getElementById("popup").style.display = "flex";
}

window.closePopup = function () {
    document.getElementById("popup").style.display = "none";
    location.reload();
  };

function scanBarcode() {
  if (detected) return;
  if (video.readyState >= 2) {
    barcodeDetector.detect(video)
      .then(barcodes => {
        if (barcodes.length > 0) {
          detected = true;
          console.log(`Detected: ${barcodes[0].rawValue}`);
          video.pause();
          showPopup(barcodes[0].rawValue);
        }
      })
      .catch(err => console.error("Detection error:", err));
  }
  requestAnimationFrame(scanBarcode);
}

const video = document.getElementById('video');

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then(stream => {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      scanBarcode();
    };
  })
  .catch(console.error);

window.submitManualBarcode = function () {
    const barcode = document.getElementById("manualBarcode").value;
    if (barcode) showPopup(barcode);
  };
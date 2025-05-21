## Challenge


-   Add a middleware that checks if the patient’s insurance approval is present (`req.body.insuranceApproved`).
    
-   If not, return a  `403 Forbidden`  with a clear error message.
    
-   Test by sending a discharge request without insurance approval.
    

## Solution & Deep Dive Explanation

  ```typescript
function insuranceCheck(req, res, next) {
  if (!req.body.insuranceApproved) {
    return res.status(403).json({ error: "Insurance approval required before discharge." });
  }
  req.dischargeLog.push({ step: "insuranceCheck", time: new Date().toISOString() });
  next();
}

app.post(
  "/discharge",
  doctorSignoffCheck,
  insuranceCheck,
  pharmacyReview,
  followupCheck,
  (req, res) => {
    req.dischargeLog.push({ step: "dischargeComplete", time: new Date().toISOString() });
    res.json({
      status: "Discharge complete",
      patient: req.body.patientName,
      log: req.dischargeLog,
    });
  }
);
  ```
  
-   `insuranceCheck`  ensures no patient is discharged without insurance approval.
    
-   The discharge log records every step, helping staff identify and fix bottlenecks.

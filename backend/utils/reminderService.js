const cron = require("node-cron");
const moment = require("moment");
const Prescription = require("../models/prescriptionModel"); 
const InPatient = require("../models/inPatientModel"); 
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendReminder = async () => {
  console.log("[Scheduler] Running Daily Reminder Job for OPD & IPD...");
  
  try {
    const tomorrowStart = moment().add(1, 'days').startOf('day').toDate();
    const tomorrowEnd = moment().add(1, 'days').endOf('day').toDate();

    // Query OPD Prescriptions
    const opdReminders = await Prescription.find({
      followUpDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
      isReminded: false
    }).populate('patientObj', 'name phone').populate('doctorId', 'name');

    // Query IPD Discharges
    const ipdReminders = await InPatient.find({
      followUpDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
      isReminded: false,
      currentStage: 2
    }).populate('patientObj', 'name phone').populate('doctorId', 'name');

    // Combine both lists into one master array
    const allReminders = [...opdReminders, ...ipdReminders];

    console.log(`Found ${opdReminders.length} OPD and ${ipdReminders.length} IPD patients to remind for tomorrow.`);

    // Process all reminders sequentially
    for (const item of allReminders) {
      
      const patient = item.patientObj; 
      const doctor = item.doctorId;

      const doctorName = doctor ? doctor.name : "your Consulting Doctor";

      if (patient && patient.phone) {
        
        let formattedPhone = patient.phone.trim();
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+91${formattedPhone}`; 
        }

        // FORMAT MESSAGE
        const msg = `Hello ${patient.name}, reminder for your follow-up with Dr. ${doctorName} tomorrow at HealthBridge.\n\nनमस्ते ${patient.name}, आपका फॉलो-अप कल Dr. ${doctorName} के साथ है।`;
        
        try {
            
            await client.messages.create({
                body: msg,
                from: process.env.TWILIO_PHONE_NUMBER, 
                to: formattedPhone 
            });
            
            console.log(`SMS Sent successfully to ${patient.name} (${formattedPhone})`);
            
            // UPDATE DATABASE
            item.isReminded = true;
            await item.save();

        } catch (smsError) {
            console.error(`Twilio Error for ${patient.name} (${formattedPhone}):`, smsError.message);
        }
      } else {
        // THE TRUTH TELLER LOGGING
        console.log(`\n Skipped record ${item._id}:`);
        if (!patient) {
            console.log(`Reason: Patient missing (Check if 'patientObj' was saved correctly!).`);
        } else if (!patient.phone) {
            console.log(`Reason: Patient '${patient.name}' exists, but their 'phone' field is empty!`);
        }
      }
    }
    
    console.log("Daily Reminder Job Cycle Completed.\n");

  } catch (error) {
    console.error("Reminder Job Error:", error);
  }
};

const initScheduler = () => {
  // Runs daily at 09:00 AM
  cron.schedule("0 9 * * *", () => {
    sendReminder();
  });
  console.log("Reminder Scheduler Initialized (Runs daily at 09:00 AM)");
};

module.exports = initScheduler;


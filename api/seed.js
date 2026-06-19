// api/seed.js — POST to seed DB with default products (run once, auth required)
const { getCollection } = require('../lib/db');
const { requireAuth }   = require('../lib/auth');
const { v4: uuidv4 }    = require('uuid');

const DEFAULT_PRODUCTS = [
  {name:"Emergency Alert System for Forest",desc:"Real-time fire, intrusion & disaster alert. Triggers SMS alerts + siren on detection. Solar-powered, IP67 rated, 24/7 autonomous operation.",price:8500,cat:"forest",badge:"new",icon:"🌲",img:"",tags:["GSM","Solar","IP67","SMS alert"],rating:"4.9",custom:false},
  {name:"Animal Repellent Device",desc:"Ultrasonic + strobe LED deterrent for crop & forest boundary protection. Motion-triggered, weatherproof, effective against elephants, boars & cattle.",price:3200,cat:"forest",badge:"hot",icon:"🐘",img:"",tags:["Ultrasonic","Motion","Solar","Weatherproof"],rating:"4.7",custom:false},
  {name:"Mobile Starter Kit — GSM",desc:"Start/stop farm motors remotely via SMS from any basic mobile. No internet needed. Works on 2G/4G networks across India.",price:2499,cat:"agri",badge:"",icon:"📱",img:"",tags:["GSM","2G/4G","SMS","No internet"],rating:"4.8",custom:false},
  {name:"Mobile Starter Kit — Wi-Fi",desc:"Control farm motors via smartphone app over Wi-Fi. Real-time status, scheduling, current sensing & dry-run protection.",price:2799,cat:"agri",badge:"",icon:"📶",img:"",tags:["Wi-Fi","App","Scheduler","ESP32"],rating:"4.7",custom:false},
  {name:"Mobile Starter Kit — LoRa",desc:"Long-range farm motor control up to 10 km. Ideal for remote fields with zero mobile network. Ultra-low power, built for rural India.",price:3499,cat:"agri",badge:"new",icon:"📡",img:"",tags:["LoRa","10km","Low power","Remote"],rating:"4.9",custom:false},
  {name:"Automated Farm Valve Controller",desc:"Open/close irrigation valves remotely or on a schedule. Supports up to 8 zones. GSM + Wi-Fi dual connectivity, soil moisture sensor input.",price:4999,cat:"agri",badge:"hot",icon:"🚿",img:"",tags:["8-zone","GSM/Wi-Fi","Auto-schedule"],rating:"4.8",custom:false},
  {name:"Car Mobile Charger Adapter",desc:"Multi-port USB + Type-C car charger. 65W fast charge, universal 12V–24V socket, surge & short-circuit protected.",price:799,cat:"home",badge:"",icon:"🔌",img:"",tags:["65W","USB-C","Universal","Fast charge"],rating:"4.6",custom:false},
  {name:"IoT Timer Switch",desc:"Smart programmable timer switch. App + manual override. Supports 16A loads, daily/weekly/custom scheduling, power consumption log.",price:1299,cat:"home",badge:"",icon:"⏱️",img:"",tags:["16A","Wi-Fi","Scheduler","App"],rating:"4.7",custom:false},
  {name:"Tank Float Water Level Converter",desc:"Converts existing float switch signal to 4–20mA or digital output for PLC/controller use. Zero calibration, works with any tank.",price:1599,cat:"home",badge:"",icon:"💧",img:"",tags:["4-20mA","Plug & play","Universal"],rating:"4.8",custom:false},
  {name:"IoT Temperature Monitor",desc:"Wireless temperature & humidity logger with cloud dashboard, SMS/email alerts & data export. ±0.3°C accuracy, 1-year battery life.",price:2199,cat:"home",badge:"new",icon:"🌡️",img:"",tags:["Wi-Fi","Cloud","±0.3°C","Alerts"],rating:"4.9",custom:false},
  {name:"IoT Home Automation Kit",desc:"Control lights, fans & appliances via app + voice commands. Works with Alexa & Google Home. 4-channel, easy retrofit installation.",price:3499,cat:"home",badge:"hot",icon:"🏠",img:"",tags:["4-channel","Alexa","Google Home","App"],rating:"4.9",custom:false},
  {name:"Industrial Data Logger",desc:"Multi-channel 4–20mA / RS485 / digital input data logger with GPRS cloud sync & onboard SD card storage. 16 channels.",price:6500,cat:"industrial",badge:"",icon:"📊",img:"",tags:["RS485","GPRS","16-ch","SD card"],rating:"4.8",custom:false},
  {name:"Industrial IoT Solution",desc:"SCADA integration, PLC interfacing, sensor networks, factory automation & condition monitoring — designed and built fully to your specification.",price:0,cat:"industrial",badge:"custom",icon:"🏭",img:"",tags:["SCADA","PLC","Modbus","Custom"],rating:"5.0",custom:true},
  {name:"Custom IoT Product Development",desc:"Tell us your idea — we design the hardware, write the firmware, integrate the cloud, and deliver a production-ready IoT product for your exact use case.",price:0,cat:"custom",badge:"custom",icon:"⚙️",img:"",tags:["PCB","Firmware","Cloud","Bulk"],rating:"5.0",custom:true},
];

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res))   return;

  try {
    const col   = await getCollection();
    const count = await col.countDocuments();
    if (count > 0) {
      return res.status(200).json({ message: `DB already has ${count} products. No seed needed.` });
    }
    const docs = DEFAULT_PRODUCTS.map(p => ({
      ...p,
      id: uuidv4(),
      createdAt: new Date(),
    }));
    await col.insertMany(docs);
    return res.status(201).json({ success: true, inserted: docs.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

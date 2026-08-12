import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  'src/components/patient/SosTrigger.jsx',
  'src/components/patient/RealMapTracker.jsx',
  'src/components/patient/PublicTracker.jsx',
  'src/components/ambulance/AmbulanceDashboard.jsx',
  'src/components/SignUpModal.jsx',
  'src/components/doctor/DoctorDashboard.jsx'
];
files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/fetch\('\/api/g, 'fetch((import.meta.env.VITE_BACKEND_URL || "") + "/api');
    content = content.replace(/fetch\(\`\/api/g, 'fetch((import.meta.env.VITE_BACKEND_URL || "") + `/api');
    content = content.replace(/\? '\/api\/auth\/register' : '\/api\/auth\/login';/g, '? (import.meta.env.VITE_BACKEND_URL || "") + "/api/auth/register" : (import.meta.env.VITE_BACKEND_URL || "") + "/api/auth/login";');
    fs.writeFileSync(fullPath, content);
  }
});
console.log('Updated API paths');

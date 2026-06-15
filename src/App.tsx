import { Route, Routes } from 'react-router-dom';
import ContentLibrary from './pages/ContentLibrary';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import ManageProgram from './pages/ManageProgram';
import Programs from './pages/Programs';
import Locations from './pages/Locations';
import DeviceMonitoring from './pages/DeviceMonitoring';
import Deployments from './pages/Deployments';
import RotationSchedule from './pages/RotationSchedule';
import Layout from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/device-monitoring" element={<DeviceMonitoring />} />
        <Route path="/content-library" element={<ContentLibrary />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:programId/manage" element={<ManageProgram />} />
        <Route path="/rotation-schedule" element={<RotationSchedule />} />
        <Route path="/deployments" element={<Deployments />} />
        <Route path="/locations" element={<Locations />} />
      </Route>
    </Routes>
  );
}

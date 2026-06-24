import { Route, Routes } from 'react-router-dom';
import ContentLibrary from './pages/ContentLibrary';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Locations from './pages/Locations';
import DeviceMonitoring from './pages/DeviceMonitoring';
import Deployments from './pages/Deployments';
import Rotation from './pages/Rotation';
import RotationSchedule from './pages/RotationSchedule';
import Login from './pages/Login';
import Layout from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/device-monitoring" element={<DeviceMonitoring />} />
        <Route path="/content-library" element={<ContentLibrary />} />
        <Route path="/rotation" element={<Rotation />} />
        <Route path="/rotation-schedule" element={<RotationSchedule />} />
        <Route path="/deployments" element={<Deployments />} />
        <Route path="/locations" element={<Locations />} />
      </Route>
    </Routes>
  );
}

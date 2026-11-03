import './App.css';
import Home from '../Pages/Home/Home';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Raffle from '../Pages/Raffle/Raffle';
import Winners from '../Pages/Winners/Winners';
import MyCats from './components/MyCats';

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/raffles" element={<Raffle />} />
        <Route path="/winners" element={<Winners />} />
        <Route path="/my-cats" element={<MyCats />} />
      </Routes>
    </>
  );
};
export default App;

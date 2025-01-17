import Board from './components/Board';
import Panel from './components/Panel';
import NavBar from './components/Navbar';
import Timer from './components/Timer';
import Createroom from './components/Room';
import './globals.css';

export default function Home() {
    return (
        <>
            <NavBar />
            <div className='container'>
                <div className='item'>
                    <Panel></Panel>
                    <Createroom></Createroom>
                </div>
                <div className='item'>
                    <Timer></Timer>
                    <Board></Board>
                </div>
            </div>
        </>
    );
}

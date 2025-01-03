import Borad from './components/Board';
import Panel from './components/Panel';
import NavBar from './components/Navbar';
import './globals.css';

export default function Home() {
    return (
        <>
            <NavBar />
            <div className='container'>
                <div className='item'>
                    <Panel></Panel>
                </div>
                <div className='item'>
                    <Borad></Borad>
                </div>
            </div>
        </>
    );
}

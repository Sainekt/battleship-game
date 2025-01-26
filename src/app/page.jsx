import Borad from './components/Board';
import Panel from './components/Panel';
import './globals.css';

export default function Home() {
    return (
        <div className='container'>
            <div className='item'>
                <Panel></Panel>
            </div>
            <div className='item'>
                <Borad></Borad>
            </div>
        </div>
    );
}

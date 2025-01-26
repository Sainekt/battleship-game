import { socket } from './Room';

export default function Modal({ handleModal, data, eventAccept, eventReject }) {
    function closeModal() {
        handleModal();
    }

    function handleAccept() {
        eventAccept();
        closeModal();
    }
    function handleReject() {
        eventReject();
        closeModal();
    }
    const lines = data.text.split('\n');
    return (
        <>
            <div className='modal' tabIndex='-1'>
                <div className='modal-dialog'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h3 className='modal-title'>{data.title}</h3>
                        </div>
                        <div className='modal-body'>
                            {lines.map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                        <div className='modal-footer'>
                            <button
                                className='accept-btn'
                                onClick={handleAccept}
                            >
                                Accept
                            </button>
                            <button
                                className='decline-btn'
                                onClick={handleReject}
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

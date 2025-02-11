export default function Modal({ data, eventAccept, eventReject }) {
    function handleAccept() {
        eventAccept();
    }
    function handleReject() {
        eventReject();
    }
    const lines = data.text.split('\n');
    return (
        <>
            <div className='fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm'></div>

            <div
                tabIndex='-1'
                className='flex overflow-y-auto overflow-x-hidden fixed inset-0 top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full'
            >
                <div className='relative p-4 w-full max-w-xl max-h-full'>
                    <div className='relative bg-white rounded-lg shadow-sm'>
                        <div className='border-b p-2 text-center bg-gray-100 rounded-t-lg'>
                            <h2 className='text-lg font-bold text-gray-800'>
                                {data.title}
                            </h2>
                        </div>
                        <button
                            onClick={handleReject}
                            className='absolute top-2 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-400 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center'
                        >
                            <svg
                                className='w-3 h-3'
                                aria-hidden='true'
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 14 14'
                            >
                                <path
                                    stroke='currentColor'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                                />
                            </svg>
                            <span className='sr-only'>Close modal</span>
                        </button>
                        <div className='p-4 md:p-5 text-center'>
                            <h3 className='mb-5 text-lg font-normal text-gray-800'>
                                <div className='modal-body'>
                                    {lines.map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                            </h3>
                            <button
                                className='text-white bg-green-600 hover:bg-green-800 w-32 mr-10 h-11 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-center'
                                onClick={handleAccept}
                            >
                                Accept
                            </button>
                            <button
                                className='text-white bg-red-600 hover:bg-red-800 w-32 h-11 ml-10 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg'
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

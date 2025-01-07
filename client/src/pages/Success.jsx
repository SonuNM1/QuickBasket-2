import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Success = () => {
  const location = useLocation()
    
  return (
    <div className='m-2 w-full max-w-md bg-green-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5'>
        <p className='text-green-800 font-bold text-lg text-center'>{Boolean(location?.state?.text) ? location?.state?.text : "Payment" } Successful</p>
        
        <div className="flex gap-4">
          {/* Shop more button */}
          <Link 
            to="/" 
            className="border border-green-900 text-green-900 hover:bg-green-900 hover:text-white transition-all px-4 py-1"
          >
            Shop more
          </Link>

          {/* Check orders button */}
          <Link 
            to="/dashboard/myorders" 
            className="border border-green-900 text-green-900 hover:bg-green-900 hover:text-white transition-all px-4 py-1"
          >
            Check orders
          </Link>
        </div>
    </div>
  )
}

export default Success

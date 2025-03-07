'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import data from '../../images/data.jpg'

export default function AdPoster() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <motion.div 
        className="max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Side - Content */}
        <div className="md:w-1/2 p-6 bg-gray-900 text-white flex flex-col justify-center relative">
          <h2 className="text-2xl font-bold text-yellow-400">Professional Data Entry Services</h2>
          <p className="mt-2 text-sm">You will get 100% accurate work</p>

          <div className="mt-4 bg-yellow-500 text-gray-900 px-4 py-2 rounded-md w-max font-semibold text-sm">OUR DATA ENTRY SERVICES</div>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed">
            <li>✔ Data Collection</li>
            <li>✔ Data Entry</li>
            <li>✔ Data Mining</li>
            <li>✔ Copy Paste Task</li>
            <li>✔ Convert Any File</li>
            <li>✔ Any Type of Excel Work</li>
            <li>✔ Any Type of MS Office Work</li>
          </ul>
        </div>

        {/* Right Side - Image and Contact */}
        <div className="md:w-1/2 relative flex flex-col items-center justify-center p-6">
          <div className="relative w-full h-64">
            <Image 
              src={data}
              alt="Data Entry Efficiency" 
              layout="fill" 
              objectFit="cover" 
              className="rounded-lg shadow-lg"
            />
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="mt-6 w-full text-center"
          >
            <Button className="bg-yellow-500 text-gray-900 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-yellow-600 transition">
              Visit our Website
            </Button>
          </motion.div>

          <div className="mt-6 text-center text-sm bg-gray-100 p-4 rounded-lg shadow-md w-full">
            <p className="font-semibold text-gray-800">For more info:</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-gray-700">
              <Phone className="w-5 h-5 text-blue-500" /> +91 7503888288
            </div>
            <div className="flex items-center justify-center gap-2 mt-2 text-gray-700">
              <Mail className="w-5 h-5 text-blue-500" /> info@boveltdigitex.com
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
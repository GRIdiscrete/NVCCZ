'use client'

import ERP from "../page";
import { FiUsers, FiTruck, FiDollarSign, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';

type CategoryId = 'procurement' | 'configuration';

interface Tool {
    category: CategoryId;
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    bgColor: string;
    hoverColor: string;
    path?: string;
}

interface Category {
    id: CategoryId;
    title: string;
    description: string;
}

const Tools = () => {
    const [openCategories, setOpenCategories] = useState({
        procurement: true,
        configuration: true
    });

    const toggleCategory = (category: CategoryId) => {
        setOpenCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const tools: Tool[] = [
        {
            category: 'procurement',
            id: 'customers',
            title: 'Customers',
            description: 'Manage customer records, transactions, and relationships',
            icon: <FiUsers className="text-navy-600" size={24} />,
            bgColor: 'bg-blue-50',
            hoverColor: 'hover:bg-blue-100',
            path: '/ERP/Tools/Clients'
        },
        {
            category: 'procurement',
            id: 'vendors',
            title: 'Vendors',
            description: 'Handle vendor information, contracts, and purchase history',
            icon: <FiTruck className="text-navy-600" size={24} />,
            bgColor: 'bg-purple-50',
            hoverColor: 'hover:bg-purple-100',
            path: '/ERP/Tools/Vendors'
        },
        {
            category: 'configuration',
            id: 'currencies',
            title: 'Currencies',
            description: 'Configure and manage currency settings and exchange rates',
            icon: <FiDollarSign className="text-navy-600" size={24} />,
            bgColor: 'bg-green-50',
            hoverColor: 'hover:bg-green-100',
            path: '/ERP/Tools/Currencies'
        }
    ];

    const categories: Category[] = [
        {
            id: 'procurement',
            title: 'Procurement',
            description: 'Tools for managing customers and vendors'
        },
        {
            id: 'configuration',
            title: 'Configuration',
            description: 'System configuration and settings'
        }
    ];

    return (
            <div className="p-6">
                <h1 className="text-3xl font-light text-gray-800 mb-2 tracking-tight">Tools</h1>
                <p className="text-gray-500 mb-8 font-light">Access various utilities and configuration tools</p>
                
                {categories.map((cat) => (
                    <div key={cat.id} className="mb-8">
                        <div 
                            className="flex items-center justify-between cursor-pointer mb-4"
                            onClick={() => toggleCategory(cat.id)}
                        >
                            <div>
                                <h2 className="text-xl font-light text-gray-800 tracking-tight">{cat.title}</h2>
                                <p className="text-gray-500 font-light text-sm">{cat.description}</p>
                            </div>
                            {openCategories[cat.id] ? (
                                <FiChevronUp className="text-gray-500" size={20} />
                            ) : (
                                <FiChevronDown className="text-gray-500" size={20} />
                            )}
                        </div>
                        
                        {openCategories[cat.id] && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tools
                                    .filter(tool => tool.category === cat.id)
                                    .map((tool) => (
                                        tool.path ? (
                                            <Link href={tool.path} key={tool.id} passHref>
                                                <div 
                                                    className={`${tool.bgColor} ${tool.hoverColor} rounded-xl p-6 border border-gray-200/50 transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-300/50 group cursor-pointer`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white shadow-xs mb-4 group-hover:scale-105 transition-transform">
                                                                {tool.icon}
                                                            </div>
                                                            <h3 className="text-xl font-light text-gray-800 tracking-tight mb-1 group-hover:text-navy-700 transition-colors">
                                                                {tool.title}
                                                            </h3>
                                                            <p className="text-gray-500 font-light text-sm">
                                                                {tool.description}
                                                            </p>
                                                        </div>
                                                        <div className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                            <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-gray-200/50 group-hover:border-gray-300/50 transition-colors">
                                                        <span className="text-xs font-light text-navy-600 tracking-wide">VIEW LIST →</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div 
                                                key={tool.id}
                                                className={`${tool.bgColor} ${tool.hoverColor} rounded-xl p-6 border border-gray-200/50 transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-300/50 group cursor-pointer`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white shadow-xs mb-4 group-hover:scale-105 transition-transform">
                                                            {tool.icon}
                                                        </div>
                                                        <h3 className="text-xl font-light text-gray-800 tracking-tight mb-1 group-hover:text-navy-700 transition-colors">
                                                            {tool.title}
                                                        </h3>
                                                        <p className="text-gray-500 font-light text-sm">
                                                            {tool.description}
                                                        </p>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                        <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-200/50 group-hover:border-gray-300/50 transition-colors">
                                                    <span className="text-xs font-light text-navy-600 tracking-wide">VIEW LIST →</span>
                                                </div>
                                            </div>
                                        )
                                    ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        
    );
}
 
export default Tools;
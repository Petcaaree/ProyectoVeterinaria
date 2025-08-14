import React from 'react';
import { Stethoscope, Heart, Shield, ArrowLeft } from 'lucide-react';

interface NavegacionServiciosProps {
  currentService: 'overview' | 'veterinary' | 'walker' | 'caregiver';
  onServiceChange: (service: 'overview' | 'veterinary' | 'walker' | 'caregiver') => void;
}

const NavegacionServicios: React.FC<NavegacionServiciosProps> = ({ currentService, onServiceChange }) => {
  const services = [
    {
      id: 'overview' as const,
      name: 'Todos los Servicios',
      shortName: 'Todos',
      icon: ArrowLeft,
      color: 'gray'
    },
    {
      id: 'veterinary' as const,
      name: 'Veterinarias',
      shortName: 'Veterinarias',
      icon: Stethoscope,
      color: 'blue'
    },
    {
      id: 'walker' as const,
      name: 'Paseadores',
      shortName: 'Paseadores',
      icon: Heart,
      color: 'green'
    },
    {
      id: 'caregiver' as const,
      name: 'Cuidadores',
      shortName: 'Cuidadores',
      icon: Shield,
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      gray: isActive ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      blue: isActive ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: isActive ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
      orange: isActive ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-1 py-4 overflow-x-auto">
          {services.map((service) => {
            const Icon = service.icon;
            const isActive = currentService === service.id;
            
            return (
              <button
                key={service.id}
                onClick={() => onServiceChange(service.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${getColorClasses(service.color, isActive)}`}
              >
                <Icon className="h-4 w-4" />
                <span>{service.name}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation - Grid Layout */}
        <div className="md:hidden py-3 overflow-hidden">
          <div className="grid grid-cols-2 gap-2 w-full">
            {services.map((service) => {
              const Icon = service.icon;
              const isActive = currentService === service.id;
              
              return (
                <button
                  key={service.id}
                  onClick={() => onServiceChange(service.id)}
                  className={`flex flex-col items-center justify-center px-2 py-3 rounded-lg font-medium transition-all duration-200 text-sm min-w-0 ${getColorClasses(service.color, isActive)}`}
                >
                  <Icon className="h-4 w-4 mb-1 flex-shrink-0" />
                  <span className="text-xs leading-tight text-center truncate w-full">{service.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


export default NavegacionServicios
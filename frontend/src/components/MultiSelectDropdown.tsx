import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectDropdownProps {
    options: Option[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

const MultiSelectDropdown = ({
    options,
    selectedValues,
    onChange,
    placeholder = 'Türleri seçin...'
}: MultiSelectDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Dışarı tıklandığında dropdown'ı kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (value: string) => {
        const newValues = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onChange(newValues);
    };

    const handleRemoveTag = (valueToRemove: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedValues.filter(value => value !== valueToRemove));
    };

    const selectedTags = selectedValues.map(value =>
        options.find(option => option.value === value)
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="min-h-[42px] p-1.5 border border-gray-300 rounded-md cursor-pointer bg-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1 p-1">
                    {selectedTags.map(tag => tag && (
                        <span
                            key={tag.value}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                        >
                            {tag.label}
                            <button
                                onClick={(e) => handleRemoveTag(tag.value, e)}
                                className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    {selectedValues.length === 0 && (
                        <span className="text-gray-500 text-sm">{placeholder}</span>
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.map(option => (
                            <div
                                key={option.value}
                                className={`
                  flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100
                  ${selectedValues.includes(option.value) ? 'bg-blue-50' : ''}
                `}
                                onClick={() => handleSelect(option.value)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(option.value)}
                                    onChange={() => { }}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm">{option.label}</span>
                            </div>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                Sonuç bulunamadı
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown; 
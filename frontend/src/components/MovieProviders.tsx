interface Provider {
    logo_path: string;
    provider_name: string;
}

interface MovieProvidersProps {
    providers: {
        [country: string]: {
            flatrate?: Provider[];
            rent?: Provider[];
            buy?: Provider[];
        };
    };
}

const MovieProviders = ({ providers }: MovieProvidersProps) => {
    // TR veya US için provider'ları al
    const countryData = providers['TR'] || providers['US'];

    if (!countryData) return null;

    const renderProviders = (title: string, providerList?: Provider[]) => {
        if (!providerList?.length) return null;

        return (
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
                <div className="flex flex-wrap gap-2">
                    {providerList.map((provider) => (
                        <div
                            key={provider.provider_name}
                            className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="w-6 h-6 rounded"
                            />
                            <span className="text-sm">{provider.provider_name}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Watch Providers</h2>
            {renderProviders('Stream', countryData.flatrate)}
            {renderProviders('Rent', countryData.rent)}
            {renderProviders('Buy', countryData.buy)}
        </div>
    );
};

export default MovieProviders; 
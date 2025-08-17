import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

  export const RateCard = ({ title, data, type, isLoading }: { title: string; data: any[]; type: string; isLoading?: boolean; }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-3 mb-4">
      <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
        <DollarSign className="w-4 h-4 mr-1.5 text-blue-400 flex-shrink-0" />
        <span className="truncate text-sm">{title}</span>
        {isLoading && (
          <div className="ml-2 animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-400 flex-shrink-0"></div>
        )}
      </h3>
      <div className="space-y-1.5">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-1.5 border-b border-gray-700/50 last:border-b-0 min-h-[32px] gap-2">
            <div className="flex-shrink-0 min-w-0 flex-1">
              <span className="font-medium text-gray-300 text-xs block truncate">
                {type === 'crypto' ? item.symbol : type === 'forex' ? item.pair : item.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0">
              <div className="text-right min-w-0">
                <span className="font-bold text-xs text-white block truncate">
                  {type === 'crypto' ? item.price : type === 'forex' ? item.rate : item.rate}
                </span>
              </div>
              <div className={`flex items-center text-xs min-w-0 ${
                item.trend === 'up' ? 'text-green-400' : 
                item.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {item.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-0.5 flex-shrink-0" /> :
                 item.trend === 'down' ? <TrendingDown className="w-3 h-3 mr-0.5 flex-shrink-0" /> : null}
                <span className="truncate text-xs">{item.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
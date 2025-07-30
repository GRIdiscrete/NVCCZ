'use client'

import React, { useEffect, useRef, useState } from 'react';

const FundClient = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Sample financial data with market cap (in billions)
  const companies = [
    { ticker: 'AAPL', return: 2.3, marketCap: 3800 },
    { ticker: 'MSFT', return: 3.1, marketCap: 2500 },
    { ticker: 'GOOGL', return: -1.2, marketCap: 1800 },
    { ticker: 'AMZN', return: 0.8, marketCap: 1600 },
    { ticker: 'META', return: 2.7, marketCap: 900 },
    { ticker: 'JPM', return: 1.4, marketCap: 500 },
    { ticker: 'BAC', return: -0.5, marketCap: 300 },
    { ticker: 'GS', return: 2.9, marketCap: 120 },
    { ticker: 'C', return: -1.1, marketCap: 100 },
    { ticker: 'MS', return: 1.8, marketCap: 150 },
    { ticker: 'JNJ', return: 0.7, marketCap: 450 },
    { ticker: 'PFE', return: -2.3, marketCap: 200 },
    { ticker: 'UNH', return: 3.5, marketCap: 480 },
    { ticker: 'MRK', return: 1.2, marketCap: 280 },
    { ticker: 'ABT', return: -0.8, marketCap: 190 }
  ];

  // Track container size changes
  useEffect(() => {
    const updateSize = () => {
      if (chartRef.current) {
        setContainerSize({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight
        });
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    updateSize(); // Initial measurement

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate color based on return value
  const getColorForReturn = (returnValue: number) => {
    if (returnValue < 0) {
      const intensity = Math.min(0.8, Math.abs(returnValue) / 5);
      return `rgba(239, 68, 68, ${0.5 + intensity})`;
    } else {
      const intensity = Math.min(0.8, returnValue / 5);
      return `rgba(34, 197, 94, ${0.5 + intensity})`;
    }
  };

  // Generate a slightly darker color for hover effects
  const getHoverColor = (returnValue: number) => {
    if (returnValue < 0) {
      return `rgba(220, 38, 38, 0.9)`;
    } else {
      return `rgba(22, 163, 74, 0.9)`;
    }
  };

  // Render the chart
  useEffect(() => {
    if (!chartRef.current || containerSize.width === 0) return;

    // Sort companies by market cap descending
    const sortedCompanies = [...companies].sort((a, b) => b.marketCap - a.marketCap);
    const container = chartRef.current;
    const { width: containerWidth, height: containerHeight } = containerSize;
    
    // Calculate responsive values
    const isSmallScreen = containerWidth < 768;
    const isMediumScreen = containerWidth >= 768 && containerWidth < 1024;
    
    // Dynamic sizing based on container dimensions
    const maxBoxSize = isSmallScreen 
      ? Math.min(containerWidth * 0.8, containerHeight * 0.8) * 0.3
      : isMediumScreen
        ? Math.min(containerWidth, containerHeight) * 0.25
        : Math.min(containerWidth, containerHeight) * 0.2;

    const spacing = isSmallScreen ? 6 : isMediumScreen ? 8 : 10;
    const minBoxSize = isSmallScreen ? 36 : isMediumScreen ? 42 : 48;
    
    // Clear previous content
    container.innerHTML = '';
    
    if (isSmallScreen) {
      // Mobile layout - vertical stack
      let currentY = 0;
      const boxWidth = containerWidth * 0.92;
      
      sortedCompanies.forEach((company) => {
        const heightRatio = company.marketCap / sortedCompanies[0].marketCap;
        const boxHeight = Math.max(minBoxSize, heightRatio * maxBoxSize * 2);
        
        const box = document.createElement('div');
        Object.assign(box.style, {
          position: 'absolute',
          left: '4%',
          top: `${currentY}px`,
          width: `${boxWidth}px`,
          height: `${boxHeight}px`,
          backgroundColor: getColorForReturn(company.return),
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: `${Math.min(16, Math.max(12, boxHeight * 0.2))}px`,
          padding: '0 12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.25s ease',
          cursor: 'pointer',
          overflow: 'hidden'
        });
        
        box.innerHTML = `
          <div class="ticker">${company.ticker}</div>
          <div style="display: flex; flex-direction: column; align-items: flex-end;">
            <div class="return" style="font-size: ${Math.max(10, boxHeight * 0.16)}px; font-weight: normal;">
              ${company.return > 0 ? '+' : ''}${company.return.toFixed(1)}%
            </div>
            <div class="market-cap" style="font-size: ${Math.max(8, boxHeight * 0.14)}px; font-weight: normal; margin-top: 2px;">
              $${(company.marketCap / 1000).toFixed(1)}T
            </div>
          </div>
        `;
        
        const showDetails = () => {
          box.style.backgroundColor = getHoverColor(company.return);
          box.style.transform = 'scale(1.02)';
          box.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        };
        
        const hideDetails = () => {
          box.style.backgroundColor = getColorForReturn(company.return);
          box.style.transform = 'scale(1)';
          box.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        };
        
        box.addEventListener('mouseenter', showDetails);
        box.addEventListener('mouseleave', hideDetails);
        box.addEventListener('touchstart', showDetails);
        box.addEventListener('touchend', hideDetails);
        
        container.appendChild(box);
        currentY += boxHeight + spacing;
      });
      
      container.style.height = `${currentY}px`;
    } else {
      // Tablet/Desktop layout - fluid grid
      interface RowItem {
        company: typeof companies[0];
        boxSize: number;
      }
      
      let currentRow: RowItem[] = [];
      let rowWidth = 0;
      let rowHeight = 0;
      const rows: { items: RowItem[]; width: number; height: number }[] = [];

      // Organize items into centered rows
      sortedCompanies.forEach((company) => {
        const sizeRatio = company.marketCap / sortedCompanies[0].marketCap;
        const boxSize = Math.max(minBoxSize, sizeRatio * maxBoxSize);
        
        if (rowWidth + boxSize > containerWidth && currentRow.length > 0) {
          rows.push({ items: currentRow, width: rowWidth - spacing, height: rowHeight });
          currentRow = [];
          rowWidth = 0;
          rowHeight = 0;
        }
        
        currentRow.push({ company, boxSize });
        rowWidth += boxSize + spacing;
        rowHeight = Math.max(rowHeight, boxSize);
      });

      if (currentRow.length > 0) {
        rows.push({ items: currentRow, width: rowWidth - spacing, height: rowHeight });
      }

      // Render centered rows
      let currentY = 0;
      rows.forEach((row) => {
        const rowStartX = (containerWidth - row.width) / 2;
        let currentX = rowStartX;
        
        row.items.forEach(({ company, boxSize }) => {
          const box = document.createElement('div');
          Object.assign(box.style, {
            position: 'absolute',
            left: `${currentX}px`,
            top: `${currentY}px`,
            width: `${boxSize}px`,
            height: `${boxSize}px`,
            backgroundColor: getColorForReturn(company.return),
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: `${Math.max(12, boxSize * 0.14)}px`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
            overflow: 'hidden',
            touchAction: 'manipulation'
          });
          
          box.innerHTML = `
            <div class="ticker">${company.ticker}</div>
            <div class="return" style="font-size: ${Math.max(10, boxSize * 0.12)}px; font-weight: normal; margin-top: 4px;">
              ${company.return > 0 ? '+' : ''}${company.return.toFixed(1)}%
            </div>
            <div class="market-cap" style="
              position: absolute;
              bottom: 0;
              width: 100%;
              text-align: center;
              background: rgba(0,0,0,0.3);
              font-size: ${Math.max(8, boxSize * 0.09)}px;
              padding: 2px 0;
              transform: translateY(100%);
              transition: transform 0.25s ease;
            ">$${(company.marketCap / 1000).toFixed(1)}T</div>
          `;
          
          const showDetails = () => {
            box.style.backgroundColor = getHoverColor(company.return);
            box.style.transform = 'scale(1.04)';
            box.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            box.style.zIndex = '10';
            
            const marketCapElement = box.querySelector('.market-cap') as HTMLElement;
            if (marketCapElement) marketCapElement.style.transform = 'translateY(0)';
          };
          
          const hideDetails = () => {
            box.style.backgroundColor = getColorForReturn(company.return);
            box.style.transform = 'scale(1)';
            box.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            box.style.zIndex = '1';
            
            const marketCapElement = box.querySelector('.market-cap') as HTMLElement;
            if (marketCapElement) marketCapElement.style.transform = 'translateY(100%)';
          };
          
          box.addEventListener('mouseenter', showDetails);
          box.addEventListener('mouseleave', hideDetails);
          box.addEventListener('touchstart', showDetails);
          box.addEventListener('touchend', hideDetails);
          
          container.appendChild(box);
          currentX += boxSize + spacing;
        });
        
        currentY += row.height + spacing;
      });
      
      container.style.height = `${currentY - spacing}px`;
    }
  }, [companies, containerSize]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-5 flex flex-col h-full">
      <div className="mb-2 md:mb-3">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-1">Top Performing Funds</h2>
        <p className="text-xs md:text-sm text-gray-600">Box size = market cap, color = daily return</p>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-3">
        <div className="flex items-center">
          <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 rounded mr-1.5"></div>
          <span className="text-xs md:text-sm text-gray-600">Positive</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-red-500 rounded mr-1.5"></div>
          <span className="text-xs md:text-sm text-gray-600">Negative</span>
        </div>
      </div>
      
      <div 
        ref={chartRef}
        className="w-full relative flex-grow flex items-center justify-center"
        style={{ minHeight: 'clamp(300px, 50vh, 500px)' }}
      />
      
      <div className="mt-2 md:mt-3 text-xs text-gray-400 text-center">
        {containerSize.width < 768 ? 'Tap for details' : 'Hover for market cap'}
      </div>
    </div>
  );
};

export default FundClient;
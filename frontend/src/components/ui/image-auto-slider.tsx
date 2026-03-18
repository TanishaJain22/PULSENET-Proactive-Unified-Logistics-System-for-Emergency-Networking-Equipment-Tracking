import React from 'react';

interface InfiniteSliderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  speed?: number;
  gap?: number;
  className?: string;
  itemClassName?: string;
}

export function InfiniteSlider<T>({ 
  items, 
  renderItem, 
  speed = 40, 
  gap = 24,
  className = "",
  itemClassName = ""
}: InfiniteSliderProps<T>) {
  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];

  return (
    <div className={`w-full relative overflow-hidden py-10 ${className}`}>
      <style>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .infinite-scroll {
          animation: scroll-right ${speed}s linear infinite;
        }

        .scroll-container {
          mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }

        .infinite-item {
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .infinite-item:hover {
          transform: scale(1.02);
        }
      `}</style>
      
      {/* Scrolling container */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="scroll-container w-full">
          <div className="infinite-scroll flex w-max" style={{ gap: `${gap}px` }}>
            {duplicatedItems.map((item, index) => (
              <div
                key={index}
                className={`flex-shrink-0 infinite-item ${itemClassName}`}
              >
                {renderItem(item, index % items.length)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

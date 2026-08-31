import * as React from 'react';
import type { SourceType } from '../types';
import '../styles/filtering.css'

type Props = {
  selected: Set<SourceType>;
  counts: Record<SourceType, number>;
  all: SourceType[];
  onToggle: (s: SourceType) => void;
  onAll: () => void;
  onOnly?: (s: SourceType) => void; // optional quick “Only X” buttons
  className?: string;
};

// export const SourceFilterBar: React.FC<Props> = ({
//   selected, counts, all, onToggle, onAll, onOnly, className
// }) => {
//   return (
//     <div className={`source-filter-bar ${className ?? ''}`}>
//       <div className="row">
//         {all.map(s => (
//           <button
//             key={s}
//             className={`pill ${selected.has(s) ? 'active' : ''}`}
//             onClick={() => onToggle(s)}
//             title={`Filter: ${s}`}
//           >
//             {s} <span className="count">{counts[s]}</span>
//           </button>
//         ))}
//         <button className="pill util" onClick={onAll}>All</button>
//       </div>
//       {onOnly && (
//         <div className="row secondary">
//           {all.map(s => (
//             <button key={`only-${s}`} className="pill solo" onClick={() => onOnly(s)}>
//               Only {s}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

export const SourceFilterBar: React.FC<Props> = ({
  selected, counts, all, onToggle, onAll, onOnly, className
}) => {
  return (
    <div className={`source-filter-bar one-line ${className ?? ''}`}>

      {onOnly && (
        <div className="group left">
          {all.map(s => (
            <button
              key={`only-${s}`}
              className="pill solo"
              onClick={() => onOnly(s)}
              title={`Only ${s}`}
            >
              Only {s}
            </button>
          ))}
            <button className="pill util" onClick={onAll}>All</button>
        </div>
      )}

      <div className="group right">
        {all.map(s => (
          <button
            key={s}
            className={`pill ${selected.has(s) ? 'active' : ''}`}
            onClick={() => onToggle(s)}
            title={`Filter: ${s}`}
          >
            {s} <span className="count">{counts[s]}</span>
          </button>
        ))}
      </div>

    </div>
  );
};
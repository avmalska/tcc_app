import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend, ChartOptions, ChartData,
} from 'chart.js';
import {ChartProps, Scatter as ScatterPlot} from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const options: ChartOptions<"scatter"> = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// export const data = {
//   datasets: [
//     {
//       label: 'A dataset',
//       data: Array.from({ length: 100 }, () => ({
//         x: faker.datatype.number({ min: -100, max: 100 }),
//         y: faker.datatype.number({ min: -100, max: 100 }),
//       })),
//       backgroundColor: 'rgba(255, 99, 132, 1)',
//     },
//   ],
// };

type Dataset = {
  label: string,
  data: number[][]
  backgroundColor: string
}

type ScatterData = {
  dataset: Dataset[]
}

const teste: ChartData<"scatter"> = {
  datasets: [
    {
      label: 'A dataset',
      data: [1, 2],
      backgroundColor: 'rgba(255, 99, 132, 1)',
    }
  ]
}

export function Scatter(): React.JSX.Element {
  return <ScatterPlot options={options} data={teste} />;
}
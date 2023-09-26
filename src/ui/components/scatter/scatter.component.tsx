import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend, ChartOptions, ChartData, ChartDataset, ChartEvent, ActiveElement, Chart,
} from 'chart.js';
import {ChartProps, Scatter as ScatterPlot} from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export type ScatterDataPoint = {x: number, y: number, name: string, steamId: string}

export type ScatterDataset = {
  label: string,
  data: ScatterDataPoint[]
  backgroundColor: string
  pointRadius: number
  pointHoverRadius: number
}

export type ScatterData = {
  datasets: ScatterDataset[]
}

type ScatterInput = {
  data: ScatterData
  onclickevent: Function
}

export function Scatter({data, onclickevent}: ScatterInput) {

  const options: ChartOptions<"scatter"> = {
    onClick(event: ChartEvent, elements: ActiveElement[], chart: Chart) {
      if (elements.length !== 0) {
        // @ts-ignore
        onclickevent(chart.data.datasets[elements[0].datasetIndex].data[elements[0].index]["steamId"])
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title(tooltipItem): string | string[] | void {
            // @ts-ignore
            return tooltipItem[0].dataset.data[tooltipItem[0].dataIndex]["name"];
          }
        }
      }
    }
  };

  return <ScatterPlot options={options} data={data} />;
}
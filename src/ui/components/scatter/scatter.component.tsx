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
          title(tooltipItems): string | string[] | void {
            return tooltipItems.map(tooltipItem=> {
              // @ts-ignore
              return tooltipItem.dataset.data[tooltipItem.dataIndex]["name"];
            })
          }
        }
      }
    },
    elements: {
      point: {
        pointStyle(context) {
          try {
            // @ts-ignore
            return context.dataset.data[context.dataIndex]["evaluated"] ? 'rectRot' : 'circle';
          } catch (e) {
            return 'circle'
          }
        },
        drawActiveElementsOnTop(context) {
          try {
            // @ts-ignore
            return context.dataset.data[context.dataIndex]["evaluated"];
          } catch (e) {
            return false;
          }
        },
        borderColor(context) {
          try {
            // @ts-ignore
            return context.dataset.data[context.dataIndex]["evaluated"] ? 'black' : 'white';
          } catch (e) {
            return 'white'
          }
        }
      }
    }
  };

  return <ScatterPlot options={options} data={data} />;
}
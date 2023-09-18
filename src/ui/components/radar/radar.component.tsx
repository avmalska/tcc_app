import {
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import {Radar as RadarChart} from 'react-chartjs-2';
import React from "react";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export type Dataset = {
  label: string,
  data: number[],
  backgroundColor: string,
  borderColor: string,
  borderWidth: number
}

export type RadarData = {
  labels: string[],
  datasets: Dataset[]
}

const options: ChartOptions<"radar"> = {
  scales: {
    r: {
      suggestedMax: 10,
      suggestedMin: 1
    }
  }
}

type RadarInput = {
  data: RadarData;
}

export const Radar: React.FC<RadarInput> = ({data}) => {
  return <RadarChart data={data} options={options}/>
}

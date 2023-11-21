import React, {useEffect, useState} from "react";
import {Player, NewPlayerValues, usePlayerApi} from "../../../hooks/api/players/use-player-api.hook";
import randomColor from 'randomcolor';
import {Radar, RadarDataset, RadarData, Scatter, ScatterDataset, ScatterData, ScatterDataPoint} from "../../components"
import Select from "react-dropdown-select"
import {hexToTransparentHex} from "../../../utils/utils";
import {Formik, Field, Form, FormikHelpers} from "formik";


const radarDefaultLabels = ["kdr", "kpr", "awpKpr", "adr", "aud", "kast",
  "multiKills", "openingRatio", "clutchesRatio", "flashTimeMean", "rating"]

const avaliableClusters = [0, 1, 2, 3, 4]
const clustersColors = ["#d64949", "#c310e3", "#1b8f83", "#3bf216", "#1f1c1c"]

const radarDataDefault: RadarData = {
  labels: radarDefaultLabels,
  datasets: [
    {
      label: 'Radar',
      data: [],
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 1,
    },
  ],
};

const scatterDataDefault: ScatterData = {
  datasets: []
}

export function PlayersScreen() {

  const {getAllPlayers, evaluateNewPlayer} = usePlayerApi();
  const [playersList, setPlayersList] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [radarLabels, setRadarLabels] = useState<Record<string, boolean>>(radarDefaultLabels.reduce((acumulador, label) => {
    return {
      ...acumulador,
      [label]: true
    }
  }, {}))

  const [groupRadarData, setGroupRadarData] = useState<RadarData>(radarDataDefault)
  const [scatterData, setScatterData] = useState<ScatterData>(scatterDataDefault)
  const [selectedClusters, setSelectedClusters] = useState<Record<string, boolean>>({
    "0": false,
    "1": false,
    "2": false,
    "3": false,
    "4": false
  })
  const [clustersMean, setClustersMean] = useState<number[][]>([])

  function getPlayerDataFiltered(player: Player) {
    return Object.entries(player).reduce((acumulador: number[], combo) => {
      return Object.keys(radarLabels).filter(label => radarLabels[label]).includes(combo[0]) ? [...acumulador, combo[1]] : [...acumulador]
    }, []);
  }

  useEffect(() => {
    const playersSelected = playersList.filter(player => selectedPlayers.includes(player.steamID))

    const playersRadarDataset: RadarDataset[] = playersSelected.map((player => {
      const playerDataFiltered: number[] = getPlayerDataFiltered(player)
      const playerDataset: RadarDataset = {
        label: player.playerName,
        data: playerDataFiltered,
        backgroundColor: player.color,
        borderColor: player.color,
        borderWidth: 1
      }
      return playerDataset
    }))

    const groupDatasetValues: number[][] = playersSelected.map(player => getPlayerDataFiltered(player))

    const groupDatasetSum: number[] = groupDatasetValues.reduce((accumulator, currentArray, currentIndex) => {
      return currentIndex !== 0 ? accumulator.map((value, index) => (value + currentArray[index])) : groupDatasetValues[0];
    }, []);

    const groupDatasetMean: number[] = groupDatasetSum.map(value => value / groupDatasetValues.length)

    const groupColor = randomColor({format: "rgba", alpha: 0.5})
    const groupPlayerRadarDataset: RadarDataset[] = [{
      label: "Group Radar",
      data: groupDatasetMean,
      backgroundColor: groupColor,
      borderColor: groupColor,
      borderWidth: 1
    }]

    const clustersRadarDataset: RadarDataset[] = Object.entries(selectedClusters)
      .filter(selectedCluster => selectedCluster[1])
      .map(clusterValue => {
        const clusterIntValue = parseInt(clusterValue[0])
        return {
          label: `Cluster ${clusterIntValue}`,
          data: clustersMean[clusterIntValue],
          backgroundColor: hexToTransparentHex(clustersColors[clusterIntValue]),
          borderColor: clustersColors[clusterIntValue],
          borderWidth: 1
        }
      })

    const finalDatasets: RadarDataset[] = playersRadarDataset.concat(groupPlayerRadarDataset).concat(clustersRadarDataset)

    setGroupRadarData({
      ...groupRadarData,
      labels: Object.keys(radarLabels).filter(label => radarLabels[label]),
      datasets: finalDatasets
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayers, playersList, radarLabels, selectedClusters]);

  useEffect(() => {
    const playersScatterDataset: ScatterDataset[] = []

    avaliableClusters.forEach((group) => {
      const data: ScatterDataPoint[] = playersList.filter(player => player.cluster === group).map(player => {
        return {
          "x": player.pca1,
          "y": player.pca2,
          "name": player.playerName,
          "steamId": player.steamID,
          "evaluated": player.evaluated
        }
      })
      playersScatterDataset.push({
        label: `Cluster ${group}`,
        data: data,
        backgroundColor: clustersColors[group]
      })
    })

    const playerScatterData: ScatterData = {
      datasets: playersScatterDataset
    }

    setScatterData(playerScatterData)
  }, [playersList]);

  useEffect(() => {
    const newClustersMeans: number[][] = []
    avaliableClusters.forEach(clusterValue => {
      const playersThisCluster = playersList.filter(player => player.cluster === clusterValue)

      const clusterDatasetValues: number[][] = playersThisCluster.map(player => getPlayerDataFiltered(player))

      const clusterDatasetSum: number[] = clusterDatasetValues.reduce((accumulator, currentArray, currentIndex) => {
        return currentIndex !== 0 ? accumulator.map((value, index) => (value + currentArray[index])) : clusterDatasetValues[0];
      }, []);

      const clusterDatasetMean: number[] = clusterDatasetSum.map(value => value / clusterDatasetValues.length)

      newClustersMeans.push(clusterDatasetMean)
    })
    setClustersMean(newClustersMeans)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playersList]);

  useEffect(() => {
    async function getAllPlayersFromPlayersApi(){
      const response = await getAllPlayers();
      return response.map(player => {
        return {...player, color: randomColor({format: "rgba", alpha: 0.5}), evaluated: false}
      });
    }
    getAllPlayersFromPlayersApi().then(response => setPlayersList(response));

  }, [getAllPlayers])

  function handleRadarLabelsChange(evento: React.ChangeEvent<HTMLInputElement>) {
    const { name } = evento.target
    const newCheckedValue = !radarLabels[name]
    const newCheckedLabels = {
      ...radarLabels,
      [name]: newCheckedValue
    }
    setRadarLabels(newCheckedLabels)
  }

  function handleSelectedClustersChange(evento: React.ChangeEvent<HTMLInputElement>) {
    const { value } = evento.target
    const newCheckedValue = !selectedClusters[value]
    const newCheckedClusters = {
      ...selectedClusters,
      [value]: newCheckedValue
    }
    setSelectedClusters(newCheckedClusters)
  }

  function onClickScatterChart(playerSteamId: string) {
    if (selectedPlayers.includes(playerSteamId)) {
      const newSelectedPlayers = selectedPlayers.filter(playerId => playerId !== playerSteamId)
      setSelectedPlayers(newSelectedPlayers)
    } else {
      const newSelectedPlayers = [...selectedPlayers, playerSteamId]
      setSelectedPlayers(newSelectedPlayers)
    }
  }

  async function onFormSubmit(values: NewPlayerValues) {
    try {
      const response = await evaluateNewPlayer(values)
      const newPlayer: Player = {...response, color: randomColor({format: "rgba", alpha: 0.5}), evaluated: true}
      setPlayersList([...playersList, newPlayer])
    } catch (e) {
      console.log(e)
    }
  }

  function onClickDeletePlayer(playerSteamId: string) {
    const newPlayersList = playersList.filter(player => player.steamID !== playerSteamId)
    setPlayersList(newPlayersList)
  }


  return (
    <div className="flex flex-col w-screen h-screen pt-2 pb-2 pr-4 pl-4">
      <div className="flex h-3/5">
        <div className="flex w-4/6">
          <Scatter data={scatterData} onclickevent={onClickScatterChart} />
        </div>
        <div className="flex w-2/6">
          <Radar data={groupRadarData}/>
        </div>
      </div>
      <div className="flex h-2/5 flex-row-reverse">
        <div className="flex flex-col gap-4 w-2/6 mb-4">
          <div>
            <Select
              placeholder="Select Players"
              options={playersList}
              multi={true}
              labelField={"playerName"}
              valueField={"steamID"}
              searchBy={"playerName"}
              values={playersList.filter((player) => selectedPlayers.includes(player.steamID))}
              onChange={(value) => setSelectedPlayers(value.map(player => player.steamID))}
            />
          </div>
          <div className="flex flex-row gap-8 justify-center">
            {Object.keys(selectedClusters).map((cluster, index) => {
              return (
                <div className="flex items-center m-1">
                  <input
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    type="checkbox"
                    id={`cluster${cluster}`}
                    name={`cluster${cluster}`}
                    value={cluster}
                    checked={selectedClusters[cluster]}
                    onChange={handleSelectedClustersChange}
                  />
                  <label
                    className="ml-2 text-sm font-medium text-gray-800"
                    htmlFor={`cluster${cluster}`}
                  >
                    {`Cluster ${cluster}`}
                  </label>
                </div>
              )
            })}
          </div>
          <div className="flex flex-col gap-1 overflow-y-scroll h-1/2 border-2">
            {radarDefaultLabels.map((label, index) => {
              return (
                <div className="flex items-center m-1">
                  <input
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    type="checkbox"
                    id={label}
                    name={label}
                    value={label}
                    checked={radarLabels[label]}
                    onChange={handleRadarLabelsChange}
                  />
                  <label
                    className="ml-2 text-sm font-medium text-gray-800"
                    htmlFor={label}
                  >
                    {label}
                  </label>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex flex-col w-4/6 mb-4 pr-12">
          <div className="flex w-full h-1/2">
            <Formik
              initialValues={{
                name: '',
                steamID: '',
                kdr: 0,
                kpr: 0,
                awpKpr: 0,
                adr: 0,
                aud: 0,
                kast: 0,
                multiKills: 0,
                openingRatio: 0,
                clutchesRatio: 0,
                flashTimeMean: 0,
                rating: 0,
              }}
              onSubmit={(
                values: NewPlayerValues
              ) => onFormSubmit(values)}
            >
              <Form>
                <div className="flex flex-wrap gap-6 mb-1">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="steamIDForm" className="mb-1 text-sm font-medium text-gray-900">Steam ID</label>
                    <Field name="steamID" type="text" id="steamIDForm" placeholder="SteamID" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="nameForm" className="mb-1 text-sm font-medium text-gray-900">Name</label>
                    <Field name="name" type="text" id="nameForm" placeholder="Name" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="kdrForm" className="mb-1 text-sm font-medium text-gray-900">Kdr</label>
                    <Field name="kdr" type="number" id="kdrForm" placeholder="Kdr" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="kprForm" className="mb-1 text-sm font-medium text-gray-900">Kpr</label>
                    <Field name="kpr" type="number" id="kprForm" placeholder="Kpr" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="awpKprForm" className="mb-1 text-sm font-medium text-gray-900">AwpKpr</label>
                    <Field name="awpKpr" type="number" id="awpKprForm" placeholder="AwpKpr" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="adrForm" className="mb-1 text-sm font-medium text-gray-900">Adr</label>
                    <Field name="adr" type="number" id="adrForm" placeholder="Adr" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="audForm" className="mb-1 text-sm font-medium text-gray-900">Aud</label>
                    <Field name="aud" type="number" id="audForm" placeholder="Aud" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="kastForm" className="mb-1 text-sm font-medium text-gray-900">Kast</label>
                    <Field name="kast" type="number" id="kastForm" placeholder="Kast" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="multiKillsForm" className="mb-1 text-sm font-medium text-gray-900">MultiKills</label>
                    <Field name="multiKills" type="number" id="multiKillsForm" placeholder="MultiKills" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="openingRatioForm" className="mb-1 text-sm font-medium text-gray-900">OpeningRatio</label>
                    <Field name="openingRatio" type="number" id="openingRatioForm" placeholder="OpeningRatio" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="clutchesRatioForm" className="mb-1 text-sm font-medium text-gray-900">ClutchesRatio</label>
                    <Field name="clutchesRatio" type="number" id="clutchesRatioForm" placeholder="ClutchesRatio" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="flashTimeMeanForm" className="mb-1 text-sm font-medium text-gray-900">FlashTimeMean</label>
                    <Field name="flashTimeMean" type="number" id="flashTimeMeanForm" placeholder="FlashTimeMean" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col gap-1 w-1/12">
                    <label htmlFor="ratingForm" className="mb-1 text-sm font-medium text-gray-900">Rating</label>
                    <Field name="rating" type="number" id="ratingForm" placeholder="Rating" className="border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5" required />
                  </div>
                  <div className="flex flex-col-reverse w-1/12">
                    <button type="submit" className="text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg text-sm text-center h-2/3 w-full p-1.5">Evaluate</button>
                  </div>
                </div>
              </Form>
            </Formik>
          </div>
          <div className="flex gap-4 w-full h-1/2">
            <div className="flex flex-col gap-1 w-2/5 overflow-y-scroll border-2 divide-y p-1">
              {playersList.filter(player => player.evaluated).map((player, index) => {
                return (
                  <div className="flex flex-row gap-2 p-1">
                    <div>
                      <p>{player.playerName}</p>
                    </div>
                    <div>
                      <button className="text-white bg-blue-500 hover:bg-blue-600 rounded-lg text-xs text-center p-1"
                              onClick={() => onClickDeletePlayer(player.steamID)}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex w-3/5 border-2">

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
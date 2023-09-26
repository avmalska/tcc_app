import React, {useEffect, useState} from "react";
import {Player, usePlayerApi} from "../../../hooks/api/players/use-player-api.hook";
import randomColor from 'randomcolor';
import {Radar, RadarDataset, RadarData, Scatter, ScatterDataset, ScatterData, ScatterDataPoint} from "../../components"
import Select from "react-dropdown-select"

const radarDefaultLabels = ["kdr", "kpr", "awpKpr", "adr", "aud", "kast",
  "multiKills", "openingRatio", "clutchesRatio", "flashTimeMean", "rating"]

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

  const {getAllPlayers} = usePlayerApi();
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

    setGroupRadarData({
      ...groupRadarData,
      labels: Object.keys(radarLabels).filter(label => radarLabels[label]),
      datasets: playersRadarDataset.concat(groupPlayerRadarDataset)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayers, playersList, radarLabels]);

  useEffect(() => {
    const clusters = [0, 1, 2, 3, 4];
    const colors = ["#d64949", "#c310e3", "#1b8f83", "#3bf216", "#1f1c1c"]
    const playersScatterDataset: ScatterDataset[] = []

    clusters.forEach((group) => {
      const data: ScatterDataPoint[] = playersList.filter(player => player.cluster === group).map(player => {
        return {
          "x": player.pca1,
          "y": player.pca2,
          "name": player.playerName,
          "steamId": player.steamID
        }
      })
      playersScatterDataset.push({
        label: `Cluster ${group}`,
        data: data,
        backgroundColor: colors[group],
        pointRadius: 4.5,
        pointHoverRadius: 5
      })
    })

    const playerScatterData: ScatterData = {
      datasets: playersScatterDataset
    }

    setScatterData(playerScatterData)
  }, [playersList]);

  useEffect(() => {
    async function getAllPlayersFromPlayersApi(){
      const response = await getAllPlayers();
      return response.map(player => {
        return {...player, color: randomColor({format: "rgba", alpha: 0.8})}
      });
    }
    getAllPlayersFromPlayersApi().then(response => setPlayersList(response));

  }, [getAllPlayers])

  function handleRadarLabelsChange(evento: React.ChangeEvent<HTMLInputElement> ) {
    const { name } = evento.target
    const newCheckedValue = !radarLabels[name]
    const newCheckedLabels = {
      ...radarLabels,
      [name]: newCheckedValue
    }
    setRadarLabels(newCheckedLabels)
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
        <div className="flex flex-col gap-4 w-2/6">
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
          <div>
            <p>asasasa</p>
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
      </div>
    </div>
  )
}
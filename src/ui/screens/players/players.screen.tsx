import React, {useEffect, useState} from "react";
import {Player, usePlayerApi} from "../../../hooks/api/players/use-player-api.hook";
import randomColor from 'randomcolor';
import {Radar, Dataset, RadarData} from "../../components"
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

export function PlayersScreen() {

  const {getAllPlayers} = usePlayerApi();
  const [playersList, setPlayersList] = useState<Player[]>([])
  const [radarLabels, setRadarLabels] = useState<Record<string, boolean>>(radarDefaultLabels.reduce((acumulador, label) => {
    return {
      ...acumulador,
      [label]: true
    }
  }, {}))

  const [radarData, setRadarData] = useState<RadarData>(radarDataDefault)
  const [groupRadarData, setGroupRadarData] = useState<RadarData>(radarDataDefault)

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])

  function getPlayerDataFiltered(player: Player) {
    return Object.entries(player).reduce((acumulador: number[], combo) => {
      return Object.keys(radarLabels).filter(label => radarLabels[label]).includes(combo[0]) ? [...acumulador, combo[1]] : [...acumulador]
    }, []);
  }


  useEffect(() => {
    const playersSelected = playersList.filter(player => selectedPlayers.includes(player.steamID))
    const playersRadarDataset: Dataset[] = playersSelected.map((player => {
      const playerDataFiltered: number[] = getPlayerDataFiltered(player)
      const playerDataset: Dataset = {
        label: player.playerName,
        data: playerDataFiltered,
        backgroundColor: player.color,
        borderColor: player.color,
        borderWidth: 1
      }
      return playerDataset
    }))

    setRadarData({
      ...radarData,
      labels: Object.keys(radarLabels).filter(label => radarLabels[label]),
      datasets: playersRadarDataset
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayers, playersList, radarLabels]);

  useEffect(() => {
    const playersSelected = playersList.filter(player => selectedPlayers.includes(player.steamID))

    const groupDatasetValues: number[][] = playersSelected.map(player => getPlayerDataFiltered(player))

    const groupDatasetSum: number[] = groupDatasetValues.reduce((accumulator, currentArray, currentIndex) => {
      return currentIndex !== 0 ? accumulator.map((value, index) => (value + currentArray[index])) : groupDatasetValues[0];
    }, []);

    const groupDatasetMean: number[] = groupDatasetSum.map(value => value / groupDatasetValues.length)

    const groupPlayerRadarDataset: Dataset[] = [{
      label: "Group Radar",
      data: groupDatasetMean,
      backgroundColor: randomColor(),
      borderColor: randomColor(),
      borderWidth: 1
    }]

    setGroupRadarData({
      ...groupRadarData,
      labels: Object.keys(radarLabels).filter(label => radarLabels[label]),
      datasets: groupPlayerRadarDataset
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayers, playersList, radarLabels]);

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

  return (
    <div className="w-screen h-screen">
      <div className="flex h-2/3">
        <div className="w-1/3">
          <Radar data={radarData}/>
        </div>
        <div className="flex flex-col w-1/3">
          <div>
            <Select
              options={playersList}
              multi={true}
              labelField={"playerName"}
              valueField={"steamID"}
              values={playersList.filter((player) => selectedPlayers.includes(player.steamID))}
              onChange={(value) => setSelectedPlayers(value.map(player => player.steamID))}
            />
          </div>

          <div className="flex flex-col gap-1 overflow-x-scroll w-full h-1/2">
            {radarDefaultLabels.map((label, index) => {
              return (
                <div>
                  <label htmlFor={label}>{label}</label>
                  <input
                    type="checkbox"
                    id={label}
                    name={label}
                    value={label}
                    checked={radarLabels[label]}
                    onChange={handleRadarLabelsChange}
                  />
                </div>
              )
            })}
          </div>
        </div>
        <div className="w-1/3">
          <Radar data={groupRadarData}/>
        </div>
      </div>
    </div>
  )
}
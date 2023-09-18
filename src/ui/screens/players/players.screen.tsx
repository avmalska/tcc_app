import React, {useEffect, useState} from "react";
import styles from "./players.module.css"
import {Player, usePlayerApi} from "../../../hooks/api/players/use-player-api.hook";
import randomColor from 'randomcolor';
import {Radar, Dataset, RadarData} from "../../components"

const radarLabels = ["kdr", "kpr", "awpKpr", "adr", "aud", "kast",
  "multiKills", "openingRatio", "clutchesRatio", "flashTimeMean", "rating"]

const radarDataDefault: RadarData = {
  labels: radarLabels,
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
  const [checkedPlayers, setCheckedPlayers] = useState<Record<string, boolean>>(playersList.reduce((acumulador, player) => {
    return {
      ...acumulador,
      [player.steamID]: false
    }
  }, {}))
  const [radarData, setRadarData] = useState<RadarData>(radarDataDefault)
  const [groupRadarData, setGroupRadarData] = useState<RadarData>(radarDataDefault)

  function getPlayerDataFiltered(player: Player) {
    return Object.entries(player).reduce((acumulador: number[], combo) => {
      return radarLabels.includes(combo[0]) ? [...acumulador, combo[1]] : [...acumulador]
    }, []);
  }

  useEffect(() => {
    const playersSelected = playersList.filter(player => checkedPlayers[player.steamID])
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
      datasets: playersRadarDataset
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedPlayers, playersList]);

  useEffect(() => {
    const playersSelected = playersList.filter(player => checkedPlayers[player.steamID])

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
      datasets: groupPlayerRadarDataset
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedPlayers, playersList]);

  useEffect(() => {
    async function getAllPlayersFromPlayersApi(){
      const response = await getAllPlayers();
      return response.map(player => {
        return {...player, color: randomColor({format: "rgba", alpha: 0.5})}
      });
    }
    getAllPlayersFromPlayersApi().then(response => setPlayersList(response));

  }, [getAllPlayers])

  function handleCheckedPlayersChange(evento: React.ChangeEvent<HTMLInputElement> ) {
    const { name } = evento.target
    const newCheckedValue = !checkedPlayers[name]
    const newPlayersCheckedObj = {
      ...checkedPlayers,
      [name]: newCheckedValue
    }
    setCheckedPlayers(newPlayersCheckedObj)
  }

  return (
    <div className={styles.playerScreen}>
      <div className={styles.radar}>
        <Radar data={radarData}/>
      </div>
      <div className={styles.playerCheckbox}>
        {playersList.map((player, index) => {
          return (
            <div className={styles.singlePlayer}>
              <label htmlFor={player.steamID}>{player.playerName}</label>
              <input
                type="checkbox"
                id={player.steamID}
                name={player.steamID}
                value={player.steamID}
                checked={checkedPlayers[player.steamID]}
                onChange={handleCheckedPlayersChange}
              />
            </div>
          )
        })}
      </div>
      <div className={styles.radarGroup}>
        <Radar data={groupRadarData}/>
      </div>
    </div>
  )
}
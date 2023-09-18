import {useMemo} from "react";
import {useHttp} from "../_base/use-http.hook";
import {URL_BASE, ALL_PLAYERS_URL} from "../../../constant/urls";

export interface Player {
  steamID:        string;
  playerName:     string;
  kills:          number;
  deaths:         number;
  kdr:            number;
  kpr:            number;
  awpKills:       number;
  awpKpr:         number;
  adr:            number;
  aud:            number;
  kast:           number;
  roundsPlayed:   number;
  multiKills:     number;
  tradedKills:    number;
  tradedDeaths:   number;
  firstKills:     number;
  firstDeaths:    number;
  openingRatio:   number;
  clutches:       number;
  clutchesRatio:  number;
  successFlashes: number;
  flashAssists:   number;
  flashTime:      number;
  flashTimeMean:  number;
  headshotPerc:   number;
  rating:         number;
  assists:        number;
  gamesPlayed:    number;
  color:          string;
}

export function usePlayerApi() {
  const httpInstance = useHttp(URL_BASE);
  // const getAllPlayers = async () => await httpInstance.get(ALL_PLAYERS_URL)

  async function getAllPlayers(): Promise<Player[]> {
    const response = await httpInstance.get(ALL_PLAYERS_URL)
    return response
  }

  return useMemo(
    () => ({
      getAllPlayers
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}
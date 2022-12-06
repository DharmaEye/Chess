import { GamePieceData } from "./game-piece-data";

export interface GameData { 
    whitePos?: any,
    blackPos?: any,
    white: GamePieceData[],
    black: GamePieceData[]
}
export interface GamePieceData { 
    x?: any,
    y?: any,
    width?: number,
    height?: number,
    img: string,
    character?: string,
    isFirstMove?: boolean,
    zIndex?: number,
    isEnemy: boolean
}
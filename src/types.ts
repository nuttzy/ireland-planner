export type SourceType = 'TV' | 'Personal' | 'GPT' | '2018';

export type Place = {
  id: string
  name: string
  type: 'stay' | 'poi' | 'food' | 'shopping' | 'activity';
  city?: string
  lat: number
  lng: number
  image?: string
  shortDesc?: string
  source?: SourceType;

  // keep?
  tags?: string[]
}
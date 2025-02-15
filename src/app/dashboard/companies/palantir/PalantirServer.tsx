import { PalantirClient } from "./PalantirClient";

interface Categories {
  commitment: string;
  location: string;
  team: string;
  allLocations: string[];
}

interface Lists {
  text: string;
  content: string;
}

interface Content {
  descriptionHtml: string;
  lists: Lists[];
  closingHtml: string;
}

interface Urls {
  show: string;
}

interface Data {
  id: string;
  text: string;
  categories: Categories;
  tags: string[];
  content: Content;
  urls: Urls;
  updatedAt: string;
}

interface PalantirServerProps {
  jobs: {
    data: Data[];
    hasNext: boolean;
    next: string;
  };
}

export const PalantirServer = ({ jobs }: PalantirServerProps) => {
  return <PalantirClient jobs={jobs} />;
};

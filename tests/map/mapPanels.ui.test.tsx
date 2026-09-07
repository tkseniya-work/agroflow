import { render, screen } from "@testing-library/react-native";
import React from "react";

import { NdviPanel } from "../../widgets/OfflineMap/MapBottomPanel/NdviPanel";
import { TrackingTab } from "../../widgets/OfflineMap/MapBottomPanel/TrackingTab";

jest.mock(
  "../../widgets/OfflineMap/MapBottomPanel/NdviReadableBarChart/NdviReadableBarChart",
  () => ({
    NdviCompactBarChart: () => null,
  }),
);

jest.mock(
  "../../widgets/OfflineMap/MapComponents/FieldNdviPreview",
  () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");

    return {
      FieldNdviPreview: () => React.createElement(Text, null, "Предпросмотр NDVI"),
    };
  },
);

jest.mock(
  "../../widgets/OfflineMap/MapComponents/FieldInfo",
  () => () => null,
);

jest.mock(
  "../../widgets/OfflineMap/MapBottomPanel/PeriodSelector/PeriodSelector",
  () => ({
    PeriodSelector: () => null,
  }),
);

jest.mock(
  "../../widgets/OfflineMap/MapBottomPanel/TechniquePickerModal/TechniquePickerModal",
  () => ({
    TechniquePickerModal: () => null,
  }),
);

jest.mock(
  "../../widgets/OfflineMap/MapBottomPanel/TechniqueTrackSummary/TechniqueTrackSummary",
  () => ({
    TechniqueTrackPager: () => null,
  }),
);

jest.mock(
  "../../widgets/OfflineMap/MapBottomPanel/SeasonSelector/SeasonSelector",
  () => ({
    SeasonSelector: () => null,
  }),
);

jest.mock(
  "../../widgets/OfflineMap/MapBottomPanel/SeasonSelector/SeasonPickerModal",
  () => ({
    SeasonPickerModal: () => null,
  }),
);

jest.mock(
  "../../widgets/OfflineMap/MapBottomPanel/TaskCard/TaskCardList",
  () => () => null,
);

jest.mock(
  "../../widgets/OfflineMap/MapComponents/TechniqueMarkers",
  () => ({
    __esModule: true,
    default: () => null,
    isTruckTechnique: () => false,
  }),
);

describe("Map panels", () => {
  test("prompts the user to select a field in the field section", () => {
    render(
      <TrackingTab
        cameraRef={{ current: null }}
        technique={[]}
        selectedTechnique={[]}
        draftPeriod={null}
        trackSummary={[]}
        view="fields"
        setView={jest.fn()}
        seasons={[]}
        selectedSeason={null}
        selectedField={null}
        productionTasks={[]}
        productionPlan={null}
        onSeasonChange={jest.fn()}
        onSelectedTechniqueChange={jest.fn()}
        onResetSelectedTechnique={jest.fn()}
        onChangeDraftPeriod={jest.fn()}
        onCreateTechniqueTracks={jest.fn()}
        clearTrack={jest.fn()}
        onShowTaskTrack={jest.fn().mockResolvedValue(false)}
        onHideTaskTrack={jest.fn()}
        collapsePanel={jest.fn()}
      />,
    );

    expect(screen.getByText("Выберите поле")).toBeTruthy();
    expect(
      screen.getByText(
        "Панель свернётся, чтобы было удобно выбрать контур на карте.",
      ),
    ).toBeTruthy();
  });

  test("switches to field information after selecting a field on the map", () => {
    const setView = jest.fn();

    render(
      <TrackingTab
        cameraRef={{ current: null }}
        technique={[]}
        selectedTechnique={[]}
        draftPeriod={null}
        trackSummary={[]}
        view="machines"
        setView={setView}
        seasons={[]}
        selectedSeason={null}
        selectedField={{ id: "field-1", name: "Поле 1" } as any}
        productionTasks={[]}
        productionPlan={null}
        onSeasonChange={jest.fn()}
        onSelectedTechniqueChange={jest.fn()}
        onResetSelectedTechnique={jest.fn()}
        onChangeDraftPeriod={jest.fn()}
        onCreateTechniqueTracks={jest.fn()}
        clearTrack={jest.fn()}
        onShowTaskTrack={jest.fn().mockResolvedValue(false)}
        onHideTaskTrack={jest.fn()}
        collapsePanel={jest.fn()}
      />,
    );

    expect(setView).toHaveBeenCalledWith("fields");
  });

  test("explains that the current season has no NDVI images", () => {
    render(
      <NdviPanel
        dates={[]}
        selectedDate={null}
        selectedField={null}
        currentSeasonFieldNdvi={[]}
        onSelectImageDate={jest.fn()}
        onSelectField={jest.fn()}
      />,
    );

    expect(screen.getByText("Нет доступных снимков")).toBeTruthy();
    expect(
      screen.getByText("Для текущего сезона пока нет спутниковых снимков."),
    ).toBeTruthy();
  });

  test("prompts the user to tap a field for the selected NDVI date", () => {
    render(
      <NdviPanel
        dates={["2026-07-01"]}
        selectedDate="2026-07-01"
        selectedField={null}
        currentSeasonFieldNdvi={[]}
        onSelectImageDate={jest.fn()}
        onSelectField={jest.fn()}
      />,
    );

    expect(screen.getByText("Выберите поле")).toBeTruthy();
    expect(
      screen.getByText(
        "Панель свернётся, чтобы было удобно выбрать контур на карте.",
      ),
    ).toBeTruthy();
  });

  test("shows a clear empty state when field NDVI values are unavailable", () => {
    render(
      <NdviPanel
        dates={["2026-07-01"]}
        selectedDate="2026-07-01"
        selectedField={{ id: "field-1", name: "Поле 1" } as any}
        currentSeasonFieldNdvi={[]}
        onSelectImageDate={jest.fn()}
        onSelectField={jest.fn()}
      />,
    );

    expect(screen.getByText("Предпросмотр NDVI")).toBeTruthy();
    expect(screen.getByText("Нет данных NDVI")).toBeTruthy();
  });
});

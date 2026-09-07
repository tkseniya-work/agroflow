import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import MapPage from "../../pages/MapPage/MapPage";

const mockReloadCurrentSeason = jest.fn().mockResolvedValue(undefined);
const mockGetCurrentLocation = jest.fn().mockResolvedValue(null);
const mockLoadFieldImageDates = jest.fn().mockResolvedValue(undefined);
const mockLoadSessionId = jest.fn().mockResolvedValue(null);
const mockLoadSeasonFieldNdvi = jest.fn().mockResolvedValue([]);
const mockBottomSheetSnapToIndex = jest.fn();
const mockSetTabBarHidden = jest.fn();

let mockSeasonState: Record<string, any>;
let mockSentinelState: Record<string, any>;
let mockTechniqueState: Record<string, any>;
let mockIsMapFocused = true;
let mockLatestOfflineMapProps: Record<string, any> = {};
let mockLatestBottomPanelProps: Record<string, any> = {};

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock("react-native-gesture-handler", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");

  return {
    GestureHandlerRootView: View,
  };
});

jest.mock("@react-navigation/native", () => ({
  useIsFocused: () => mockIsMapFocused,
}));

jest.mock("@gorhom/bottom-sheet", () => () => null);

jest.mock("../../widgets/OfflineMap/MapboxOfflineMap", () =>
  (props: Record<string, any>) => {
    mockLatestOfflineMapProps = props;
    return null;
  },
);
jest.mock(
  "../../widgets/OfflineMap/MapBottomPanel/MapBottomPanel",
  () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");

    return (props: { bottomSheetRef: React.MutableRefObject<any> }) => {
      const { bottomSheetRef } = props;
      mockLatestBottomPanelProps = props;

      React.useEffect(() => {
        bottomSheetRef.current = {
          snapToIndex: mockBottomSheetSnapToIndex,
        };

        return () => {
          bottomSheetRef.current = null;
        };
      }, [bottomSheetRef]);

      return null;
    };
  },
);
jest.mock(
  "../../widgets/OfflineMap/MeasurementPanel",
  () => () => null,
);

jest.mock("../../features/localData/useLocalData", () => ({
  useCompanyInfo: () => ({ location: "[30, 50]" }),
}));

jest.mock("../../shared/lib/useAlerts", () => ({
  useAlerts: () => ({ showOtherInformation: jest.fn() }),
}));

jest.mock("../../shared/lib/geolocation/useCurrentLocation", () => ({
  useCurrentLocation: () => ({
    getCurrentLocation: mockGetCurrentLocation,
  }),
}));

jest.mock("../../shared/lib/useNetworkStatus", () => ({
  useNetworkStatus: () => ({
    forcedOffline: false,
    isEnvOfflineMode: false,
  }),
}));

jest.mock("../../widgets/OfflineMap/useOfflineRegions", () => ({
  useOfflineRegions: () => ({
    regions: [],
    loadRegions: jest.fn().mockResolvedValue(undefined),
    saveRegion: jest.fn().mockResolvedValue(undefined),
    deleteRegion: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock("../../entities/techniqueMonitoring", () => ({
  useTechniqueMonitoring: () => mockTechniqueState,
}));

const createTechniqueState = () => ({
    loading: false,
    initialLoading: false,
    technique: [],
    selectedTechnique: [],
    draftPeriod: null,
    tracks: [],
    trackSummary: [],
    errorTrack: null,
    loadingType: null,
    loadTechnique: jest.fn(),
    loadTechiqueTrack: jest.fn().mockResolvedValue(undefined),
    setSelectedTechnique: jest.fn(),
    setDraftPeriod: jest.fn(),
    setTracks: jest.fn(),
    setTrackSummary: jest.fn(),
    loadProductionTaskTrack: jest.fn().mockResolvedValue(false),
    clearTrack: jest.fn(),
});

jest.mock("../../entities/season", () => ({
  useSeasonFields: () => mockSeasonState,
}));

jest.mock("../../entities/productionTask/lib/useProductionTask", () => ({
  useProductionTask: () => ({ productionTasks: [] }),
}));

jest.mock("../../entities/sentinel", () => ({
  useSentinelData: () => mockSentinelState,
}));

jest.mock("../../shared/lib/tabBarVisibility", () => ({
  useTabBarVisibility: () => ({ setTabBarHidden: mockSetTabBarHidden }),
}));

const createSeasonState = () => ({
  seasons: [],
  currentSeason: null,
  fields: [],
  selectedField: null,
  loading: false,
  error: null,
  changeSeason: jest.fn().mockResolvedValue(undefined),
  reloadCurrentSeason: mockReloadCurrentSeason,
  selectedFieldChange: jest.fn(),
});

const createSentinelState = () => ({
  fieldImageDates: [],
  selectedDate: null,
  sessionId: null,
  seasonFieldNdvi: [],
  loadingFieldImageDates: false,
  loadingSessionId: false,
  loadingSeasonFieldNdvi: false,
  fieldImageDatesError: null,
  sessionIdError: null,
  seasonFieldNdviError: null,
  loadFieldImageDates: mockLoadFieldImageDates,
  loadSessionId: mockLoadSessionId,
  loadSeasonFieldNdvi: mockLoadSeasonFieldNdvi,
  onSelectImageDate: jest.fn(),
});

describe("Main map page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSeasonState = createSeasonState();
    mockSentinelState = createSentinelState();
    mockTechniqueState = createTechniqueState();
    mockIsMapFocused = true;
    mockLatestOfflineMapProps = {};
    mockLatestBottomPanelProps = {};
  });

  test("prompts to open field information after selecting a map field", () => {
    const field = { id: "field-1", name: "Поле Северное", area: 120 };
    const { rerender } = render(<MapPage />);

    act(() => {
      mockLatestOfflineMapProps.onSelectedFieldChange(field);
    });
    expect(mockSeasonState.selectedFieldChange).toHaveBeenCalledWith(field);

    mockSeasonState = { ...mockSeasonState, selectedField: field };
    rerender(<MapPage />);

    expect(screen.getByText("Поле Северное")).toBeTruthy();
    expect(
      screen.getByText(
        "Откройте нижнюю панель, чтобы посмотреть информацию о поле.",
      ),
    ).toBeTruthy();

    fireEvent.press(
      screen.getByRole("button", {
        name: "Открыть информацию о выбранном поле",
      }),
    );
    expect(mockBottomSheetSnapToIndex).toHaveBeenCalledWith(1);
  });

  test("hides the field hint when the bottom panel expands fully", () => {
    const field = { id: "field-1", name: "Поле Северное", area: 120 };
    const { rerender } = render(<MapPage />);

    act(() => {
      mockLatestOfflineMapProps.onSelectedFieldChange(field);
    });
    mockSeasonState = { ...mockSeasonState, selectedField: field };
    rerender(<MapPage />);

    expect(screen.getByText("Поле Северное")).toBeTruthy();

    act(() => {
      mockLatestBottomPanelProps.onChangeSheet(2);
    });

    expect(screen.queryByText("Поле Северное")).toBeNull();
    expect(
      screen.queryByText(
        "Откройте нижнюю панель, чтобы посмотреть информацию о поле.",
      ),
    ).toBeNull();
  });

  test("shows the field hint when the bottom panel is half open", () => {
    const field = { id: "field-1", name: "Поле Северное", area: 120 };
    const { rerender } = render(<MapPage />);

    act(() => {
      mockLatestBottomPanelProps.onChangeSheet(1);
    });
    act(() => {
      mockLatestOfflineMapProps.onSelectedFieldChange(field);
    });
    mockSeasonState = { ...mockSeasonState, selectedField: field };
    rerender(<MapPage />);

    expect(screen.getByText("Поле Северное")).toBeTruthy();
    expect(
      screen.getByText(
        "Откройте нижнюю панель, чтобы посмотреть информацию о поле.",
      ),
    ).toBeTruthy();
  });

  test("does not show the field hint when the bottom panel is already open", () => {
    const field = { id: "field-1", name: "Поле Северное", area: 120 };
    const { rerender } = render(<MapPage />);

    act(() => {
      mockLatestBottomPanelProps.onChangeSheet(2);
    });
    act(() => {
      mockLatestOfflineMapProps.onSelectedFieldChange(field);
    });
    mockSeasonState = { ...mockSeasonState, selectedField: field };
    rerender(<MapPage />);

    expect(screen.queryByText("Поле Северное")).toBeNull();
    expect(
      screen.queryByText(
        "Откройте нижнюю панель, чтобы посмотреть информацию о поле.",
      ),
    ).toBeNull();
  });

  test("collapses the bottom panel when leaving the map", async () => {
    const { rerender } = render(<MapPage />);

    mockIsMapFocused = false;
    rerender(<MapPage />);

    await waitFor(() => {
      expect(mockBottomSheetSnapToIndex).toHaveBeenCalledWith(0);
      expect(mockSetTabBarHidden).toHaveBeenLastCalledWith(false);
    });
  });

  test("shows initial map loading in the shared status banner", () => {
    mockTechniqueState.initialLoading = true;

    render(<MapPage />);

    expect(screen.getByText("Подготавливаем карту")).toBeTruthy();
    expect(
      screen.getByText("Загружаем технику и актуальные данные."),
    ).toBeTruthy();
  });

  test("shows a field loading error and retries it", async () => {
    mockSeasonState.error = "Нет подключения к интернету";

    render(<MapPage />);

    expect(screen.getByText("Не удалось загрузить поля")).toBeTruthy();

    fireEvent.press(
      screen.getByRole("button", {
        name: "Повторить загрузку данных карты",
      }),
    );

    await waitFor(() => {
      expect(mockReloadCurrentSeason).toHaveBeenCalledTimes(1);
    });
  });

  test("requests geolocation only after the location button is pressed", async () => {
    render(<MapPage />);

    expect(mockGetCurrentLocation).not.toHaveBeenCalled();

    fireEvent.press(
      screen.getByRole("button", {
        name: "Показать моё местоположение",
      }),
    );

    await waitFor(() => {
      expect(mockGetCurrentLocation).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Местоположение недоступно")).toBeTruthy();
    });
  });
});

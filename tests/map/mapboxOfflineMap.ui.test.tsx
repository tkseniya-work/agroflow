import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import MapboxOfflineMap from "../../widgets/OfflineMap/MapboxOfflineMap";

let mockLatestMapViewProps: Record<string, any> = {};
let mockLatestCameraProps: Record<string, any> = {};
const mockSaveRegion = jest.fn();
const mockRequestLocationPermission = jest.fn();

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock("@rnmapbox/maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");

  const MapView = React.forwardRef(function MockMapView(
    props: any,
    ref: any,
  ) {
    mockLatestMapViewProps = props;
    React.useImperativeHandle(ref, () => ({
      getCenter: async () => [30, 50],
      getZoom: async () => 12,
    }));

    return React.createElement(View, { testID: "map-view" }, props.children);
  });
  const ShapeSource = ({ children }: any) =>
    React.createElement(View, null, children);
  const Empty = () => null;
  const Camera = (props: Record<string, any>) => {
    mockLatestCameraProps = props;
    return null;
  };
  const LocationPuck = () =>
    React.createElement(View, { testID: "location-puck" });

  const mapbox = {
    setAccessToken: jest.fn(),
    MapView,
    Camera,
    ShapeSource,
    FillLayer: Empty,
    MarkerView: ShapeSource,
    StyleURL: { Satellite: "satellite" },
  };

  return {
    __esModule: true,
    default: mapbox,
    LocationPuck,
    UserLocation: Empty,
  };
});

jest.mock("../../widgets/OfflineMap/useMapboxMap", () => ({
  useMapboxMap: () => ({
    cameraPosition: {
      centerCoordinate: [30, 50],
      zoomLevel: 12,
    },
    saveRegion: mockSaveRegion,
  }),
}));

jest.mock("../../shared/lib/geolocation/useLocationPermissions", () => ({
  useLocationPermissions: () => ({
    requestLocationPermission: mockRequestLocationPermission,
  }),
}));

jest.mock(
  "../../widgets/OfflineMap/MapComponents/StartEndMarkers",
  () => () => null,
);
jest.mock(
  "../../widgets/OfflineMap/MapComponents/TechniqueMarkers",
  () => () => null,
);
jest.mock(
  "../../widgets/OfflineMap/MapComponents/TechniqueTracks",
  () => () => null,
);
jest.mock(
  "../../widgets/OfflineMap/MapComponents/MapTooltip",
  () => () => null,
);
jest.mock(
  "../../widgets/OfflineMap/MapComponents/SeasonFileds",
  () => ({
    SeasonFields: () => null,
  }),
);
jest.mock(
  "../../widgets/OfflineMap/MapComponents/MeasurementLayer",
  () => () => null,
);
jest.mock(
  "../../widgets/OfflineMap/MapComponents/NdviWmsLayer",
  () => ({
    NdviWmsLayer: () => null,
    MAP_ANCHOR_LAYER_ID: "map-anchor-layer",
  }),
);

const renderMap = (
  props: Partial<React.ComponentProps<typeof MapboxOfflineMap>> = {},
) =>
  render(
    <MapboxOfflineMap
      hasLocationPermission={false}
      showTechniqueLabels
      selectedField={null}
      onSelectedFieldChange={jest.fn()}
      {...props}
    />,
  );

describe("MapboxOfflineMap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLatestMapViewProps = {};
    mockLatestCameraProps = {};
    mockRequestLocationPermission.mockResolvedValue(true);
  });

  test("keeps rotation enabled and shows a compass for orientation", () => {
    renderMap();

    expect(mockLatestMapViewProps.rotateEnabled).toBe(true);
    expect(mockLatestMapViewProps.compassEnabled).toBe(true);
    expect(mockLatestMapViewProps.compassFadeWhenNorth).toBe(true);
  });

  test("shows user location on a task map without following it", async () => {
    renderMap({ showUserLocation: true });

    await waitFor(() => {
      expect(screen.getByTestId("location-puck")).toBeTruthy();
    });

    expect(mockRequestLocationPermission).toHaveBeenCalledTimes(1);
    expect(mockLatestCameraProps.followUserLocation).toBe(false);
  });

  test("saves a selected region once through the parent handler", async () => {
    const onRegionSaved = jest.fn().mockResolvedValue(undefined);
    const setInteractionMode = jest.fn();

    renderMap({
      interactionMode: "selectRegion",
      onRegionSaved,
      setInteractionMode,
    });

    fireEvent.press(
      screen.getByRole("button", { name: "Скачать офлайн-область" }),
    );

    await waitFor(() => {
      expect(onRegionSaved).toHaveBeenCalledTimes(1);
    });

    expect(mockSaveRegion).not.toHaveBeenCalled();
    expect(setInteractionMode).toHaveBeenCalledWith("none");
  });
});

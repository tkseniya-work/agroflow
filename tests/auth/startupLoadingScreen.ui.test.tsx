import { act, fireEvent, render } from "@testing-library/react-native";

import { StartupLoadingScreen } from "../../widgets/AppStartup";

describe("StartupLoadingScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("offers forced offline mode only after a long startup", () => {
    const onContinueOffline = jest.fn();
    const view = render(
      <StartupLoadingScreen onContinueOffline={onContinueOffline} />,
    );

    expect(
      view.queryByText("Перейти в офлайн-режим"),
    ).not.toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(5_000);
    });

    fireEvent.press(view.getByText("Перейти в офлайн-режим"));

    expect(onContinueOffline).toHaveBeenCalledTimes(1);
  });
});

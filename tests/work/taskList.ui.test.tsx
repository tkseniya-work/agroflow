/* eslint-disable @typescript-eslint/no-require-imports */

import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { FlatList } from "react-native";

import { TaskList } from "../../widgets/Work/TaskList";

jest.mock("../../widgets/Work/components/TaskCard", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  return {
    TaskCard: ({
      item,
      onEdit,
      onDelete,
      onOpenZones,
      onOpenCosts,
      onOpenTask,
    }) =>
      React.createElement(
        View,
        null,
        React.createElement(Text, null, `task:${item.id}`),
        React.createElement(
          Pressable,
          { accessibilityLabel: "edit-task", onPress: () => onEdit(item) },
          React.createElement(Text, null, "edit"),
        ),
        React.createElement(
          Pressable,
          { accessibilityLabel: "delete-task", onPress: () => onDelete(item) },
          React.createElement(Text, null, "delete"),
        ),
        React.createElement(
          Pressable,
          {
            accessibilityLabel: "open-zones",
            onPress: () => onOpenZones(item.zones),
          },
          React.createElement(Text, null, "zones"),
        ),
        React.createElement(
          Pressable,
          {
            accessibilityLabel: "open-costs",
            onPress: () => onOpenCosts(item),
          },
          React.createElement(Text, null, "costs"),
        ),
        React.createElement(
          Pressable,
          { accessibilityLabel: "open-task", onPress: () => onOpenTask(item) },
          React.createElement(Text, null, "open"),
        ),
      ),
  };
});

const createProps = (overrides: Record<string, unknown> = {}) => ({
  tasks: [] as any[],
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  refreshing: false,
  searchQuery: "",
  onRefresh: jest.fn(),
  onLoadMore: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onOpenZones: jest.fn(),
  onOpenCosts: jest.fn(),
  onOpenTask: jest.fn(),
  ...overrides,
});

describe("TaskList", () => {
  test("shows loading and search-aware empty states", () => {
    const props = createProps({ isLoading: true });
    const { rerender } = render(<TaskList {...props} />);

    expect(screen.getByText("Загрузка заданий...")).toBeTruthy();

    rerender(<TaskList {...props} isLoading={false} searchQuery="посев" />);
    expect(
      screen.getByText("По вашему запросу заданий не найдено"),
    ).toBeTruthy();

    rerender(<TaskList {...props} isLoading={false} searchQuery="" />);
    expect(screen.getByText("Заданий пока нет")).toBeTruthy();
  });

  test("forwards task actions to the parent", () => {
    const task = { id: "task-1", zones: ["Поле 1"] } as any;
    const props = createProps({ tasks: [task] });
    render(<TaskList {...props} />);

    fireEvent.press(screen.getByLabelText("edit-task"));
    fireEvent.press(screen.getByLabelText("delete-task"));
    fireEvent.press(screen.getByLabelText("open-zones"));
    fireEvent.press(screen.getByLabelText("open-costs"));
    fireEvent.press(screen.getByLabelText("open-task"));

    expect(props.onEdit).toHaveBeenCalledWith(task);
    expect(props.onDelete).toHaveBeenCalledWith(task);
    expect(props.onOpenZones).toHaveBeenCalledWith(["Поле 1"]);
    expect(props.onOpenCosts).toHaveBeenCalledWith(task);
    expect(props.onOpenTask).toHaveBeenCalledWith(task);
  });

  test("loads the next page only when pagination is available", () => {
    const onLoadMore = jest.fn();
    const props = createProps({ hasMore: true, onLoadMore });
    const { rerender, UNSAFE_getByType } = render(<TaskList {...props} />);

    act(() => {
      UNSAFE_getByType(FlatList).props.onEndReached();
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(<TaskList {...props} isLoadingMore />);
    act(() => {
      UNSAFE_getByType(FlatList).props.onEndReached();
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  test("reports active scrolling so the parent can hide floating actions", () => {
    const onScrollStart = jest.fn();
    const onScrollEnd = jest.fn();
    const props = createProps({ onScrollStart, onScrollEnd });
    const { UNSAFE_getByType } = render(<TaskList {...props} />);
    const list = UNSAFE_getByType(FlatList);

    act(() => {
      list.props.onScrollBeginDrag();
      list.props.onMomentumScrollBegin();
      list.props.onMomentumScrollEnd();
      list.props.onScrollEndDrag({
        nativeEvent: { velocity: { y: 0 } },
      });
    });

    expect(onScrollStart).toHaveBeenCalledTimes(2);
    expect(onScrollEnd).toHaveBeenCalledTimes(2);
  });
});

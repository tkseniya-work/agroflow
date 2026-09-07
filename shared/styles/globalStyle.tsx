import {StyleService} from '@ui-kitten/components';

export const globalStyle = StyleService.create({
  topNavigation: {
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  shadow: {
    shadowColor: 'background-basic-color-11',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.34,
    shadowRadius: 8,
    elevation: 10,
  },
});

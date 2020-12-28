import React from 'react';
import { ButtonBaseProps, makeStyles } from '@material-ui/core';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { Link as RouterLink } from 'react-router-dom'

// const styles = {
//   root: {
//     background: (props: any) =>
//       props.color === 'red'
//         ? 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'
//         : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
//     border: 0,
//     borderRadius: 3,
//     boxShadow: (props: any) =>
//       props.color === 'red'
//         ? '0 3px 5px 2px rgba(255, 105, 135, .3)'
//         : '0 3px 5px 2px rgba(33, 203, 243, .3)',
//     color: 'white',
//     height: 48,
//     padding: '0 30px',
//     margin: 8,
//   },
// };

// const RawButton = (props: any) => {
//   const { classes, color, ...other } = props;
//   return <Button className={classes.root} {...other} />;
// }

// RawButton.propTypes = {
//   /**
//    * Override or extend the styles applied to the component.
//    */
//   classes: PropTypes.object.isRequired,
//   color: PropTypes.oneOf(['blue', 'red']).isRequired,
// };

// const MyButton = withStyles(styles)(RawButton);

const backgroundColors = {
  'red': 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  'blue': 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  'gray': 'linear-gradient(45deg, #888888 30%, #CACACA 90%)'
}

const boxShadow = {
  'red': '0 3px 5px 2px rgba(255, 105, 135, .3)',
  'blue': '0 3px 5px 2px rgba(33, 203, 243, .3)',
  'gray': '0 3px 5px 2px rgba(80, 80, 80, .3)'
}

const getBackgroundColor = (props: ButtonBaseProps) => {
  if (props.disabled) {
    return null;
  }

  return backgroundColors[props.color];
}

const getBoxShadow = (props: ButtonBaseProps) => {
  if (props.disabled) {
    return null;
  }

  return boxShadow[props.color];
}

const useStyles = makeStyles(theme => ({
  root: {
    background: getBackgroundColor,
    border: 0,
    borderRadius: 3,
    boxShadow: getBoxShadow,
    color: 'white',
    height: 48,
    padding: '0 30px',
  }
}));


interface Props {
  color: "red" | "blue" | "gray";
  disabled?: boolean;
  fullWidth?: boolean;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void,
}


export const StyledButton: React.FC<Props> = (props) => {
  const classes = useStyles({color: props.color, disabled: props.disabled});

  const propsToInclude: any = {
    disabled: props.disabled,
    fullWidth: props.fullWidth,
    href: props.href,
    onClick: props.onClick
  }

  if (props.href) {
    propsToInclude.to = props.href
    propsToInclude.component = RouterLink
  }

  return (<Button classes={{root: classes.root}} {...propsToInclude}>{props.children}</Button>)

}

import { type ReactElement, type ReactNode } from "react";

type TypographyVariantsClasses = {
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  "body-2xl-extrabold": string;
  "body-xl-tall": string;
  "body-xl": string;
  "body-xl-bold": string;
  "body-lg-bold": string;
  "body-lg-medium": string;
  "body-md-medium-tall": string;
  "body-md-tall": string;
  "body-md-bold": string;
  "body-md-medium": string;
  "body-md": string;
  "body-sm": string;
  "body-sm-medium": string;
  "body-sm-bold": string;
  "body-xs": string;
  "body-xs-medium": string;
  "body-xs-bold": string;
};

type TypographyElementsVariants = {
  h1: ReactElement;
  h2: ReactElement;
  h3: ReactElement;
  h4: ReactElement;
  h5: ReactElement;
  h6: ReactElement;
  p: ReactElement;
  span: ReactElement;
};

type TypographyProps = {
  variant: keyof TypographyVariantsClasses;
  as: keyof TypographyElementsVariants;
  className?: string;
  children?: ReactNode;
};

const Typography = (props: TypographyProps) => {
  const { variant, as, className, children } = props;
  const variantsClasses: TypographyVariantsClasses = {
    /* H1, Bold, 64px */
    h1: "text-5xl font-bold",
    /* H2, Bold, 40px */
    h2: "text-4xl font-bold",
    /* H3, Bold, 32px */
    h3: "text-3xl font-bold",
    /* H4, Bold, 24px */
    h4: "text-2xl font-bold",
    /* H5, bold , 16px*/
    h5: "text-base font-bold",
    /* Body/2XL, ExtraBold, 25px, 160% */
    "body-2xl-extrabold": "text-2xl font-extrabold",
    /* Body/XL, Bold, 20px, 160% */
    "body-xl-tall": "text-xl-tall font-bold",
    /* Body/XL, Regular, 20px, 160% */
    "body-xl": "text-xl-tall font-regular",
    /* Body/XL, Bold, 20px, 140% */
    "body-xl-bold": "text-xl font-bold",
    /* Body/LG, Bold, 18px */
    "body-lg-bold": "text-lg font-bold",
    /* Body/LG, Medium, 18px */
    "body-lg-medium": "text-lg font-medium",
    /* Body/MD, Medium, 16px, 160% */
    "body-md-medium-tall": "text-base-tall font-medium",
    /* Body/MD, Regular, 16px, 160% */
    "body-md-tall": "text-base-tall font-regular",
    /* Body/MD, Bold, 16px, 150% */
    "body-md-bold": "text-base font-bold",
    /* Body/MD, Medium, 16px, 150% */
    "body-md-medium": "text-base font-medium",
    /* Body/MD, Regular, 16px, 150% */
    "body-md": "text-base font-regular",
    /* Body/SM, Regular, 140%, 14px */
    "body-sm": "text-sm font-regular",
    /* Body/SM, Medium, 140%, 14px */
    "body-sm-medium": "text-sm font-medium",
    /* Body/SM, Bold, 140%, 14px */
    "body-sm-bold": "text-sm font-bold",
    /* Body/XS, Regular, 12px */
    "body-xs": "text-xs font-regular",
    /* Body/XS, Medium, 12px */
    "body-xs-medium": "text-xs font-medium",
    /* Body/XS, Bold, 12px */
    "body-xs-bold": "text-xs font-bold",
  };

  const classes = `${variantsClasses[variant]} ${className || ""}`.trim();

  const variants: TypographyElementsVariants = {
    h1: <h1 className={classes}>{children}</h1>,
    h2: <h2 className={classes}>{children}</h2>,
    h3: <h3 className={classes}>{children}</h3>,
    h4: <h4 className={classes}>{children}</h4>,
    h5: <h5 className={classes}>{children}</h5>,
    h6: <h6 className={classes}>{children}</h6>,
    p: <p className={classes}>{children}</p>,
    span: <span className={classes}>{children}</span>,
  };

  return variants[as] ? variants[as] : null;
};

export default Typography;

'use client';

import { SVGProps } from 'react';

import TypescriptLogo from './typescript-logo.svg';
import PythonLogo from './python-logo.svg';
import GolangLogo from './golang-logo.svg';
import ReactLogo from './react-logo.svg';
import FigmaLogo from './figma-logo.svg';
import WordpressLogo from './wordpress-logo.svg';
import JupyterLogo from './jupyter-logo.svg';
import TensorflowLogo from './tensorflow-logo.svg';
import AwsLogo from './aws-logo.svg';
import GoogleCloudLogo from './google-cloud-logo.svg';
import DockerLogo from './docker-logo.svg';
import CircleciLogo from './circleci-logo.svg';
import GithubLogo from './github-logo.svg';
import XLogo from './x.svg';

const ICONS = {
  typescript: TypescriptLogo,
  python: PythonLogo,
  golang: GolangLogo,
  react: ReactLogo,
  figma: FigmaLogo,
  wordpress: WordpressLogo,
  jupyter: JupyterLogo,
  tensorflow: TensorflowLogo,
  aws: AwsLogo,
  googleCloud: GoogleCloudLogo,
  docker: DockerLogo,
  circleci: CircleciLogo,
  github: GithubLogo,
  x: XLogo,
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: keyof typeof ICONS;
}

export default function SvgIcon({ name, ...rest }: IconProps) {
  const Icon = ICONS[name];

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Icon {...rest} />;
}

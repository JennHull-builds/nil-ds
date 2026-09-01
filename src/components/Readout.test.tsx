import { render, screen } from '@testing-library/react';
import { Readout } from './Readout';

describe('Readout', () => {
  it('renders the value', () => {
    render(<Readout value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('omits the label row when no label is given', () => {
    render(<Readout value={10} />);
    expect(screen.queryByText(/label/i)).not.toBeInTheDocument();
  });

  it('renders label, unit and sublabel when provided', () => {
    render(<Readout label="TEMP" value={72} unit="°F" sublabel="Feels warm" />);
    expect(screen.getByText('TEMP')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('°F')).toBeInTheDocument();
    expect(screen.getByText('Feels warm')).toBeInTheDocument();
  });

  it('defaults to the lg size scale', () => {
    render(<Readout value="99" />);
    expect(screen.getByText('99')).toHaveStyle({ fontSize: 'var(--nil-type-scale-3xl)' });
  });

  it('applies the md size scale when requested', () => {
    render(<Readout value="99" size="md" />);
    expect(screen.getByText('99')).toHaveStyle({ fontSize: 'var(--nil-type-scale-2xl)' });
  });

  it('accepts string values', () => {
    render(<Readout value="N/A" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});

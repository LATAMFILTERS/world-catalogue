import { permanentRedirect } from 'next/navigation';

export default function ProductsLegacyEntry() {
  permanentRedirect('/families/');
}

import Image from 'next/image'

export const Icons = {
  logo: () => (
    <Image
      src='/logo.png' // Ensure the correct path inside public folder
      alt='Logo'
      width={150} // Adjust width
      height={150} // Adjust height
      priority // Optional: Loads the logo faster
    />
  ),
}

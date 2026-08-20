import GoogleSignInButton from './GoogleSignInButton'
import FacebookSignInButton from './FacebookSignInButton'

export default function SocialSignInButtons({
  disabled,
  onGoogle,
  onFacebook,
  googleLabel,
  facebookLabel,
}) {
  return (
    <div className="space-y-3">
      <GoogleSignInButton onClick={onGoogle} disabled={disabled} label={googleLabel} />
      <FacebookSignInButton onClick={onFacebook} disabled={disabled} label={facebookLabel} />
    </div>
  )
}

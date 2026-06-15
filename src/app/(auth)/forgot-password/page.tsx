'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const ForgotPasswordValidator = z.object({
  email: z.string().email(),
})

type TForgotPasswordValidator = z.infer<typeof ForgotPasswordValidator>

const ForgotPasswordPage = () => {
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TForgotPasswordValidator>({
    resolver: zodResolver(ForgotPasswordValidator),
  })

  const { mutate, isLoading } = trpc.auth.forgotPassword.useMutation({
    onSuccess: ({ sentToEmail }) => {
      toast.success(`Reset link sent to ${sentToEmail}`)
      router.push('/sign-in')
    },
    onError: (err) => {
      toast.error('Something went wrong. Please try again.')
    },
  })

  const onSubmit = ({ email }: TForgotPasswordValidator) => {
    mutate({ email })
  }

  return (
    <div className='container relative flex pt-20 pb-20 flex-col items-center justify-center lg:px-0'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col items-center space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Reset Password
          </h1>
          <p className='text-sm text-muted-foreground'>
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <div className='grid gap-1 py-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                {...register('email')}
                placeholder='you@example.com'
                type='email'
              />
              {errors?.email && (
                <p className='text-sm text-red-500'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button disabled={isLoading}>
              {isLoading && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Send Reset Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
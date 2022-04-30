export default {
  concurrency: Math.max(os.cpus().length - 1, 1)
}
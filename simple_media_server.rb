require 'sinatra'
require 'json'

require 'sys/filesystem'

files_root_dir = '/tmp/media-server-files'

get '/' do # return the angular app
  erb :index, :locals => {:files_root_dir => files_root_dir}
end

post '/api/upload' do # upload files
  # return plain text summary of upload for now
  content_type :text
  res = "I received the following files:\n"
  res << params['files'].map{|f| f[:filename] }.join("\n")
  res
end

get '/api/fs-stat/*' do |path|
  content_type :json
  path = File.join(files_root_dir, path)
  if File.exist?(path)
    stat = Sys::Filesystem.stat(path)
    hsh = {}
    stat.instance_variables.each do |var|
      hsh[var.to_s[1..-1]] = stat.instance_variable_get(var)
    end
    hsh.to_json
  else
    status 404
    {error: "'#{path}' does not exist."}.to_json
  end
end

get '/api/ls/*' do |dir|
  content_type :json
  dir = File.join(files_root_dir, dir)
  if Dir.exists?(dir)
    files = []
    Dir[File.join(dir, '*')].each do |file|
      files << {
        name: File.basename(file),
        absPath: file,
        path: file[files_root_dir.length..-1],
        modified: File.mtime(file).to_i,
        type: Dir.exist?(file) ? 'directory' : 'file',
      }
    end
    files.to_json
  else
    if File.file?(dir)
      status 400
      {error: "'#{dir}' is not a directory."}.to_json
    else
      status 404
      {error: "'#{dir}' does not exist."}.to_json
    end
  end
end

get '/api/file/*' do |file|
  send_file(File.join(files_root_dir, file))
end

post '/api/mkdir/*' do |dir|
  content_type :json
  File.join(files_root_dir, dir)
end

post '/api/rmdir/*' do |dir|
  content_type :json
  begin
    removed = Dir.rmdir(File.join(files_root_dir, dir)) # returns 0
    halt 200
    # {status: 200, message: "Removed '#{dir}'."}.to_json
  rescue Errno::ENOTEMPTY
    status 400
    {error: "Directory is not empty. Remove files in '#{dir}' and then remove it."}.to_json
  rescue Errno::ENOENT
    status 404
    {error: "Directory '#{dir}' does not exist."}.to_json
  end

end

post '/api/rm/*' do |file|
  content_type :json
  begin
    deleted = File.delete(File.join(files_root_dir, file)) # returns num of deleted files
    halt 200
  rescue Errno::ENOENT
    status 404
    {error: "File '#{file}' does not exist."}.to_json
  rescue Errno::EPERM
    status 400
    if Dir.exist?(File.join(files_root_dir, file))
      msg = "'#{file}' is a directory and cannot be removed with the /api/rm/ endpoint (try the /api/rmdir/ api endpoint)."
    else
      msg = "'#{file}' cannot be removed."
    end
    {error: msg}.to_json
  end
end

post '/api/mv/*' do |file|
  content_type :json
  puts "params[:command] -> #{params[:command]}"
  File.join(files_root_dir, file)
end

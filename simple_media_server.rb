require 'sinatra'
require 'json'

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

get '/api/ls/*' do |dir|
  content_type :json
  dir = File.join(files_root_dir, dir)
  if Dir.exists?(dir)
    files = []
    Dir[File.join(dir, '*')].each do |file|
      files << {
        name: File.basename(file),
        modified: File.mtime(file),
        type: Dir.exist?(file) ? 'directory' : 'file',
      }

    end
    {status: 200, data: files}.to_json
  else
    if File.file?(dir)
      {status: 400, message: "'#{dir}' is not a directory."}.to_json
    else
      {status: 404, message: "'#{dir}' does not exist."}.to_json
    end
  end
end

post '/api/mkdir/*' do |dir|
  content_type :json
  File.join(files_root_dir, dir)
end

post '/api/rmdir/*' do |dir|
  content_type :json
  begin
    removed = Dir.rmdir(File.join(files_root_dir, dir)) # returns 0
    {status: 200, message: "Removed '#{dir}'."}.to_json
  rescue Errno::ENOTEMPTY
    {status: 400,
     message: "Directory is not empty. Remove files in '#{dir}' and then remove it."}.to_json
  rescue Errno::ENOENT
    {status: 404, message: "Directory '#{dir}' does not exist."}.to_json
  end

end

post '/api/rm/*' do |file|
  content_type :json
  begin
    deleted = File.delete(File.join(files_root_dir, file)) # returns num of deleted files
    {status: 200, message: "Deleted '#{file}'."}.to_json
  rescue Errno::ENOENT
    {status: 404, message: "File '#{file}' does not exist."}.to_json
  end
end

post '/api/mv/*' do |file|
  content_type :json
  puts "params[:command] -> #{params[:command]}"
  File.join(files_root_dir, file)
end
